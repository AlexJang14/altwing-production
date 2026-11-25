"""Conservative API/feed/approved-field extraction; no AI inference."""
import datetime as dt, json, os, re, xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlencode,urljoin
from .model import canonical_url, digest
from .fetcher import FetchFailure,safe_url

class Page(HTMLParser):
    def __init__(self):super().__init__();self.skip=0;self.text=[];self.title=[];self.in_title=False;self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag in {'script','style','noscript'}:self.skip+=1
        if tag=='title':self.in_title=True
        if tag=='a':
            a=dict(attrs)
            if a.get('href'):self.links.append(a['href'])
    def handle_endtag(self,tag):
        if tag in {'script','style','noscript'}:self.skip=max(0,self.skip-1)
        if tag=='title':self.in_title=False
    def handle_data(self,text):
        if not self.skip:self.text.append(text)
        if self.in_title:self.title.append(text)

def evidence(field,source,response,now):return {'field':field,'source_id':source['id'],'url':safe_url(response['url']),'observed_at':now,'content_sha256':response['sha256'],'method':source['adapter']}

def collect_scorecard(source,fetcher,now,demo=False):
    key=os.environ.get('COLLEGE_SCORECARD_API_KEY')
    if not key and not demo:raise FetchFailure('COLLEGE_SCORECARD_API_KEY is not configured; retained snapshot unchanged')
    key=key or 'DEMO_KEY';observations=[];seen=set();total=None
    fields=['id','school.name','school.city','school.state','school.school_url','latest.academics.program_percentage.engineering','latest.cost.tuition.in_state','latest.cost.tuition.out_of_state','latest.admissions.admission_rate.overall','latest.admissions.act_scores.25th_percentile','latest.admissions.act_scores.75th_percentile']
    for page in range(80):
        params={'api_key':key,'_fields':','.join(fields),'school.operating':'1','school.degrees_awarded.predominant':'3','per_page':'3' if demo else '100','page':page}
        response=fetcher.fetch(source['url']+'?'+urlencode(params),source)
        data=json.loads(response['data']);rows=data.get('results');count=data.get('metadata',{}).get('total')
        if not isinstance(rows,list) or type(count)!=int or count<0:raise FetchFailure('Scorecard response schema changed')
        if count<1:raise FetchFailure('Empty official institution dataset; existing records retained')
        if total is not None and total!=count:raise FetchFailure('Scorecard pagination total changed during collection')
        total=count
        for row in rows:
            ident=row.get('id');name=row.get('school.name')
            if type(ident)!=int or not isinstance(name,str) or ident in seen:raise FetchFailure('Invalid or duplicate Scorecard institution ID')
            seen.add(ident)
            if 'latest.academics.program_percentage.engineering' not in row:raise FetchFailure('Engineering field absent from Scorecard response')
            engineering=row.get('latest.academics.program_percentage.engineering')
            if not isinstance(engineering,(int,float)) or engineering<=0:continue
            stats={k:row.get(k) for k in fields if k.startswith('latest.')}
            observations.append({'record_id':'college:scorecard-'+str(ident),'facts':{'name':name,'location':', '.join(x for x in [row.get('school.city'),row.get('school.state')] if x),'statistics':stats},'evidence':[evidence(k,source,response,now) for k in ['name','location','statistics']],'source_id':source['id'],'content_sha256':response['sha256'],'dataset_cohort':'Latest returned API variables may use different cohorts; publication year was not supplied.'})
        if demo:return {'observations':observations,'discoveries':[],'complete':False,'reason':'Public rate-limited API probe only; full pagination intentionally not performed','returned_rows':len(seen),'total_rows':total}
        if len(seen)==total and not observations:raise FetchFailure('Empty engineering subset; existing records retained')
        if len(seen)==total:return {'observations':observations,'discoveries':[],'complete':True,'returned_rows':len(seen),'total_rows':total}
        if not rows:raise FetchFailure('Incomplete Scorecard pagination')
    raise FetchFailure('Scorecard page budget exceeded; partial dataset withheld')

def collect_feed(source,fetcher,now):
    response=fetcher.fetch(source['url'],source);raw=response['data']
    if b'<!DOCTYPE HTML' in raw.upper() or b'<HTML' in raw[:1000].upper():raise FetchFailure('Official feed returned HTML instead of RSS/Atom; no discoveries inferred')
    if b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():raise FetchFailure('Feed entities prohibited')
    tree=ET.fromstring(raw)
    if tree.tag not in {'rss','{http://www.w3.org/2005/Atom}feed'}:raise FetchFailure('Unsupported feed format; retained previous discoveries')
    items=tree.findall('.//item') or tree.findall('.//{http://www.w3.org/2005/Atom}entry');out=[]
    for node in items[:100]:
        title=node.findtext('title') or node.findtext('{http://www.w3.org/2005/Atom}title') or ''
        link=node.findtext('link')
        if not link:
            el=node.find('{http://www.w3.org/2005/Atom}link');link=el.get('href') if el is not None else None
        if not link or not re.search(r'high.school|scholarship|internship|competition|mentorship|student|engineering|STEM',title,re.I):continue
        try:link=canonical_url(urljoin(source['url'],link));fetcher.check_url(link,dict(source,allowed_paths=['/']))
        except (ValueError,FetchFailure):continue
        out.append({'key':digest([source['id'],link]),'name':title[:180],'source_url':link,'source_id':source['id'],'first_discovered_at':now,'source_publication_text':(node.findtext('pubDate') or node.findtext('{http://www.w3.org/2005/Atom}published') or '')[:100],'status':'review_required','reason':'Discovery only: grade/age/cycle/eligibility and rights must be checked before publishing. No feed body or image is reproduced.'})
    return {'observations':[],'discoveries':out,'complete':True,'returned_rows':len(items),'content_sha256':response['sha256']}

def collect_html(source,fetcher,now):
    response=fetcher.fetch(source['url'],source);page=Page();page.feed(response['data'].decode('utf-8',errors='replace'));text=' '.join(' '.join(page.text).split())
    observations=[];facts={};proof=[];conflicts=[]
    # Rules are source-specific, reviewed patterns with explicit semantic anchors.
    # Zero/multiple matches are uncertain, never a guessed deadline or grade.
    for rule in source.get('field_rules',[]):
        matches=re.findall(rule['pattern'],text,re.I)
        unique=list({v.casefold():v for v in matches}.values())
        if len(unique)!=1:conflicts.append(rule['field']);continue
        value=unique[0]
        if rule.get('type')=='iso_date':
            if not re.fullmatch(r'20\d{2}-\d{2}-\d{2}',value):conflicts.append(rule['field']);continue
            dt.date.fromisoformat(value)
        elif rule.get('type')=='grades':value=[int(x) for x in re.findall(r'\b(?:9|10|11|12)\b',value)]
        elif rule.get('type')=='year' and not re.fullmatch(r'20\d{2}',value):conflicts.append(rule['field']);continue
        facts[rule['field']]=value;proof.append(evidence(rule['field'],source,response,now))
    if source.get('record_id') and facts:observations.append({'record_id':source['record_id'],'facts':facts,'evidence':proof,'source_id':source['id'],'content_sha256':response['sha256']})
    return {'observations':observations,'discoveries':[],'complete':not conflicts,'ambiguous_fields':conflicts,'page_title':' '.join(page.title)[:180],'content_sha256':response['sha256'],'links':[canonical_url(urljoin(source['url'],p)) for p in page.links if p.startswith('https://') and not any(x in p.lower() for x in ['token=','api_key='])][:30] if source.get('discover_links') else []}

def collect(source,fetcher,now,demo=False):
    if source['adapter']=='scorecard':return collect_scorecard(source,fetcher,now,demo)
    if source['adapter']=='rss':return collect_feed(source,fetcher,now)
    if source['adapter']=='html':return collect_html(source,fetcher,now)
    raise FetchFailure('Manual source: no permitted automated adapter is configured')
