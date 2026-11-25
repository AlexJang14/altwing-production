"""Validation, deadline calculation, identity and atomic public snapshot IO."""
import copy, datetime as dt, hashlib, ipaddress, json, os, re, tempfile
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

DISCIPLINES = {'aerospace','mechanical','electrical','computer','chemical','biomedical','civil','industrial','materials','environmental','nuclear','robotics','software','petroleum'}
KINDS = {'college','major','admissions','internship','research','summer_program','competition','scholarship','mentorship','career_resource'}
VERIFICATIONS = {'legacy_reviewed','unverified','partially_verified','verified','review_required'}
FIELDS = {'name','organization','disciplines','grades','age_min','age_max','citizenship','residency','location','format','cost','stipend','financial_aid','opening_date','deadline','deadline_timezone','application_cycle','application_url','source_url','statistics','accreditation','source_published_at','source_status','admissions_requirements','program_information','career_resources'}
TOP = {'id','legacy_id','kind','facts','display','first_discovered_at','imported_legacy','last_changed_at','verification','lifecycle','history'}
DISPLAY_OPP = {'title','organization','category','location','state','format','status','timing','eligibility','cost','costBand','description','majors','grades','officialUrl','lastVerified','needsGradeCheck'}
DISPLAY_COLLEGE = {'name','shortName','location','state','admissionRate','act25','act75','tuitionInState','tuitionOutOfState','sourceYear','source','sourceUrl','testingPolicy','testingPolicyNote','engineeringMajors'}

def utcnow(): return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
def parse_time(value):
    if value is None: return None
    if not isinstance(value,str): raise ValueError('Date must be ISO text or null')
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}',value): return dt.datetime.combine(dt.date.fromisoformat(value),dt.time(),dt.timezone.utc)
    parsed=dt.datetime.fromisoformat(value.replace('Z','+00:00'))
    if parsed.tzinfo is None: raise ValueError('Timestamp needs a timezone')
    return parsed.astimezone(dt.timezone.utc)

def canonical_url(value):
    u=urlsplit(value)
    if u.scheme!='https' or not u.hostname or u.username or u.password or u.port not in (None,443): raise ValueError('Public HTTPS URL required')
    host=u.hostname.lower()
    if host in {'localhost','altwing.org','www.altwing.org'} or host.endswith(('.local','.internal','.chatgpt.site')): raise ValueError('Private/application hosts are prohibited')
    try:
        if not ipaddress.ip_address(host).is_global: raise ValueError('Private address prohibited')
    except ValueError as exc:
        if re.fullmatch(r'[\d.]+',host) or ':' in host: raise ValueError('IP address URLs prohibited') from exc
    query=[]
    for key,val in parse_qsl(u.query,keep_blank_values=True):
        if any(x in key.lower() for x in ['token','secret','password','api_key','apikey','credential']): raise ValueError('Credential parameter prohibited in stored URLs')
        if not key.lower().startswith(('utm_','fbclid','gclid')): query.append((key,val))
    return urlunsplit(('https',host,u.path.rstrip('/') or '/',urlencode(sorted(query)),''))

def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()).hexdigest()
def snapshot_hash(snapshot): return digest({k:v for k,v in snapshot.items() if k!='snapshot_id'})

def validate_record(r,now=None):
    now=now or parse_time(utcnow())
    if set(r)!=TOP or not re.fullmatch(r'[a-z0-9][a-z0-9:_.-]{1,160}',r['id']): raise ValueError('Invalid record shape or ID')
    if r['kind'] not in KINDS or not isinstance(r['facts'],dict) or set(r['facts'])!=FIELDS: raise ValueError('Unknown kind/fact')
    if type(r['imported_legacy'])!=bool or (r['legacy_id'] is not None and (not isinstance(r['legacy_id'],str) or r['id'].split(':',1)[-1]!=r['legacy_id'])):raise ValueError('Stable legacy ID mismatch')
    if not isinstance(r['display'],dict):raise ValueError('Display patch must be an object')
    f=r['facts']
    for key in ('name','organization','application_url','source_url'):
        if not isinstance(f.get(key),str) or not f[key].strip(): raise ValueError('Missing identity/source')
    canonical_url(f['application_url']);canonical_url(f['source_url'])
    if not isinstance(f.get('disciplines'),list) or not f['disciplines'] or set(f['disciplines'])-DISCIPLINES: raise ValueError('Unknown discipline')
    grades=f.get('grades')
    if grades is not None and (not isinstance(grades,list) or any(type(x)!=int or x not in range(9,13) for x in grades)): raise ValueError('Invalid grades')
    for key in ('age_min','age_max'):
        if f.get(key) is not None and (type(f[key])!=int or not 0<=f[key]<=100): raise ValueError('Invalid age')
    if f.get('age_min') is not None and f.get('age_max') is not None and f['age_min']>f['age_max']: raise ValueError('Age range reversed')
    for key in ('opening_date','deadline','source_published_at'): parse_time(f.get(key))
    for key in ('statistics','admissions_requirements','program_information'):
        if f[key] is not None and not isinstance(f[key],dict):raise ValueError('Structured facts must be objects or null')
    if f['accreditation'] is not None and not isinstance(f['accreditation'],(str,dict)):raise ValueError('Invalid accreditation fact')
    if f['career_resources'] is not None and (not isinstance(f['career_resources'],list) or any(not isinstance(x,dict) for x in f['career_resources'])):raise ValueError('Invalid career resource list')
    if f['program_information'] and 'engineering_majors' in f['program_information']:
        majors=f['program_information']['engineering_majors']
        if not isinstance(majors,list) or any(x not in DISCIPLINES for x in majors):raise ValueError('Invalid exact program mapping')
    if f['admissions_requirements'] and 'testing_policy' in f['admissions_requirements'] and f['admissions_requirements']['testing_policy'] not in {'REQUIRED','OPTIONAL','NOT_USED','CHECK'}:raise ValueError('Invalid testing policy')
    cycle=f.get('application_cycle')
    if cycle is not None and not re.fullmatch(r'20\d{2}',cycle): raise ValueError('Cycle must be an explicitly confirmed year or null')
    if f.get('deadline'):
        if not cycle or int(f['deadline'][:4]) not in {int(cycle)-1,int(cycle)}:raise ValueError('Deadline needs an explicitly confirmed application cycle')
        if f['deadline'][:4]!=cycle:
            proof={e['field']:e for e in r['verification']['evidence']}
            if not {'deadline','application_cycle'}<=set(proof) or proof['deadline']['source_id']!=proof['application_cycle']['source_id'] or proof['deadline']['content_sha256']!=proof['application_cycle']['content_sha256']:raise ValueError('Cross-year deadline requires explicit same-source cycle evidence; never reuse a prior cycle date')
    if f.get('opening_date') and f.get('deadline') and parse_time(f['opening_date'])>parse_time(f['deadline']): raise ValueError('Opening follows deadline')
    v=r['verification']
    if set(v)!={'status','last_verified_at','verified_fields','evidence'} or not isinstance(v['verified_fields'],list) or not isinstance(v['evidence'],list):raise ValueError('Invalid verification shape')
    if v['status'] not in VERIFICATIONS or not set(v['verified_fields'])<=FIELDS: raise ValueError('Invalid verification')
    verified=parse_time(v['last_verified_at'])
    if verified and verified>now+dt.timedelta(minutes=5): raise ValueError('Future verification date')
    if v['status'] in {'verified','partially_verified'} and (not verified or not v['evidence'] or not v['verified_fields']): raise ValueError('Verified facts require source evidence')
    for evidence in v['evidence']:
        if set(evidence)!= {'field','source_id','url','observed_at','content_sha256','method'}: raise ValueError('Unknown evidence field')
        canonical_url(evidence['url']);observed=parse_time(evidence['observed_at'])
        if not observed or observed>now+dt.timedelta(minutes=5):raise ValueError('Evidence timestamp missing or future')
        if evidence['field'] not in FIELDS or not re.fullmatch(r'[0-9a-f]{64}',evidence['content_sha256']): raise ValueError('Invalid field evidence')
    if set(v['verified_fields'])-{e['field'] for e in v['evidence']}:raise ValueError('Every verified field needs evidence')
    if v['status']=='verified' and not {k for k,value in f.items() if value is not None}<=set(v['verified_fields']):raise ValueError('Fully verified status requires evidence for every known field')
    for key in ['name','organization','citizenship','residency','location','format','cost','stipend','financial_aid','deadline_timezone','source_status']:
        if f.get(key) is not None and (not isinstance(f[key],str) or len(f[key])>2000):raise ValueError('Invalid factual text')
    if f.get('format') not in {None,'IN PERSON','ONLINE','HYBRID','VARIES','UNKNOWN'}:raise ValueError('Unknown delivery format')
    if r['display'].get('officialUrl') and r['display']['officialUrl']!=f['application_url']:raise ValueError('UI application URL must match source-linked fact')
    if 'grades' in r['display'] and ('grades' not in v['verified_fields'] or r['display']['grades']!=[str(x) for x in f['grades']]):raise ValueError('UI grade change needs matching verified fact')
    if r['display'].get('costBand') not in {None,'UNKNOWN'} and ('cost' not in v['verified_fields'] or not f['cost']):raise ValueError('Cost filter cannot claim verified affordability without evidence')
    if any(k in r['display'] for k in ['admissionRate','act25','act75','tuitionInState','tuitionOutOfState']) and 'statistics' not in v['verified_fields']:raise ValueError('Statistics display requires verified source data')
    if any(k in r['display'] for k in ['testingPolicy','testingPolicyNote']) and 'admissions_requirements' not in v['verified_fields']:raise ValueError('Admissions UI changes need verified current requirements')
    if 'engineeringMajors' in r['display'] and 'program_information' not in v['verified_fields']:raise ValueError('Exact program mapping requires explicit program evidence')
    display_allowed=DISPLAY_COLLEGE if r['kind']=='college' else DISPLAY_OPP if r['kind'] in {'internship','research','summer_program','competition','scholarship','mentorship'} else set()
    if set(r['display'])-display_allowed: raise ValueError('Unapproved UI field')
    for key,value in r['display'].items():
        if key in {'officialUrl','sourceUrl'}:canonical_url(value)
        elif key in {'grades','majors','engineeringMajors'}:
            if not isinstance(value,list) or any(not isinstance(x,str) for x in value):raise ValueError('Invalid UI list')
        elif key=='needsGradeCheck':
            if type(value)!=bool:raise ValueError('Invalid UI boolean')
        elif key in {'act25','act75','tuitionInState','tuitionOutOfState'}:
            if value is not None and (type(value) not in (int,float) or value<0):raise ValueError('Invalid UI statistic')
        elif not isinstance(value,str) or len(value)>4000:raise ValueError('Invalid UI text')
    for key in ('first_discovered_at','last_changed_at'):
        checked=parse_time(r[key])
        if checked and checked>now+dt.timedelta(minutes=5):raise ValueError('Future discovery/change date')
    if set(r['lifecycle'])!={'status','as_of','deadline_precision'} or r['lifecycle']['status'] not in {'cycle_unverified','archived','closing_soon','open_now','upcoming','next_cycle_pending'} or r['lifecycle']['deadline_precision'] not in {'unknown','date_only','instant'}:raise ValueError('Invalid lifecycle status')
    parse_time(r['lifecycle']['as_of'])
    if not isinstance(r['history'],list): raise ValueError('History required')
    # Prevent sensitive field additions through nested payloads or review records.
    serialized=json.dumps(r)
    if re.search(r'"(?:session_id|student_id|email|feedback|testimonial|admin_email|access_token|password)"\s*:',serialized,re.I): raise ValueError('Personal/private fields prohibited')
    return r

def validate_snapshot(s,now=None):
    if set(s)!={'schema_version','snapshot_id','previous_snapshot_id','generated_at','records'} or s['schema_version']!=1: raise ValueError('Invalid snapshot shape')
    if snapshot_hash(s)!=s['snapshot_id']: raise ValueError('Snapshot checksum mismatch')
    if not isinstance(s['records'],list) or not s['records']: raise ValueError('Empty snapshot prohibited')
    ids=set();identities={}
    for r in s['records']:
        validate_record(r,now)
        if r['id'] in ids: raise ValueError('Duplicate stable ID')
        ids.add(r['id'])
        key=identity(r)
        if key in identities and (not r['imported_legacy'] or not identities[key]['imported_legacy']):raise ValueError('Duplicate canonical entity/cycle; aliases require review')
        identities[key]=r
    return s

def identity(r):
    f=r['facts'];return (r['kind'],canonical_url(f['application_url']),f.get('application_cycle'))

def lifecycle(r,now):
    f=r['facts'];v=r['verification'];fields=set(v['verified_fields']);deadline=parse_time(f.get('deadline')) if 'deadline' in fields else None
    opening=parse_time(f.get('opening_date')) if 'opening_date' in fields else None
    status='cycle_unverified'
    if deadline:
        # Date-only deadlines with unknown timezone receive a conservative 48h
        # boundary. No timezone or opening date is fabricated.
        end=deadline+(dt.timedelta(days=2) if len(f['deadline'])==10 else dt.timedelta())
        if now>end: status='archived'
        elif (deadline.date()-now.date()).days<=14: status='closing_soon'
        elif opening and now>=opening+(dt.timedelta(days=1) if len(f['opening_date'])==10 else dt.timedelta()):status='open_now'
        else:status='upcoming'
    elif f.get('source_status')=='closed' and 'source_status' in fields:status='archived'
    elif f.get('source_status')=='next_cycle_pending' and 'source_status' in fields:status='next_cycle_pending'
    elif f.get('source_status')=='open' and 'source_status' in fields: status='open_now'
    return {'status':status,'as_of':now.date().isoformat(),'deadline_precision':'date_only' if deadline and len(f['deadline'])==10 else 'instant' if deadline else 'unknown'}

def atomic_json(path,data):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix='.'+path.name+'.',dir=path.parent)
    try:
        with os.fdopen(fd,'w') as f: json.dump(data,f,ensure_ascii=False,sort_keys=True,indent=2,allow_nan=False);f.write('\n');f.flush();os.fsync(f.fileno())
        os.replace(tmp,path)
        directory=os.open(path.parent,os.O_RDONLY)
        try:os.fsync(directory)
        finally:os.close(directory)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)

def make_snapshot(records,previous,now):
    s={'schema_version':1,'snapshot_id':'','previous_snapshot_id':previous,'generated_at':now,'records':sorted(records,key=lambda r:r['id'])};s['snapshot_id']=snapshot_hash(s);return validate_snapshot(s)
