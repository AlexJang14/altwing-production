"""Build an offline engineering university directory from the official institution ZIP.
Usage: python3 scripts/import-scorecard.py /path/to/official.zip
The explicit release label prevents a snapshot from appearing to be live data.
"""
import csv, io, json, re, sys, zipfile
from pathlib import Path
base=Path(__file__).resolve().parents[1]
release='May 19, 2025 release; metrics may use different cohorts'
source_url='https://catalog.data.gov/dataset/college-scorecard'
with zipfile.ZipFile(sys.argv[1]) as z:
    members=[n for n in z.namelist() if n.endswith('.csv')]
    if len(members)!=1: raise SystemExit('Expected one institution CSV')
    rows=list(csv.DictReader(io.TextIOWrapper(z.open(members[0]),encoding='utf-8-sig')))
curated=json.loads((base/'scripts/curated-scorecard-ids.json').read_text())
missing={'UNITID','INSTNM','PCIP14','PREDDEG','CURROPER','INSTURL'}-set(rows[0])
if missing: raise SystemExit(f'Missing required columns: {missing}')
def number(value):
    try: return float(value)
    except (ValueError,TypeError): return None
def integer(value):
    n=number(value);return int(n) if n is not None else None
out=[]
for r in rows:
    if r['PREDDEG']!='3' or r['CURROPER']!='1' or not (number(r['PCIP14']) or 0)>0: continue
    if r['UNITID'] in curated.values(): continue
    url=r['INSTURL'].strip()
    if not url: continue
    if not url.startswith(('https://','http://')): url='https://'+url
    if not re.match(r'^https?://[^\s/]+',url): continue
    rate=number(r.get('ADM_RATE'))
    out.append(dict(id='scorecard-'+r['UNITID'],scorecardId=int(r['UNITID']),name=r['INSTNM'],shortName=r['INSTNM'],location=r['CITY']+', '+r['STABBR'],state=r['STABBR'],description='Reports engineering graduates in the College Scorecard institution snapshot. Check the university for your exact major and current requirements.',engineeringMajors=[],majorCoverage='ENGINEERING_GENERAL',admissionsUrl=url,engineeringUrl=url,sat25=None,sat50=None,sat75=None,act25=integer(r.get('ACTCM25')),act50=None,act75=integer(r.get('ACTCM75')),averageGpa='Not reported in this import',admissionRate=f'{rate*100:.1f}% overall (historical snapshot)' if rate is not None else 'Not reported in this snapshot',testingPolicy='Check current university policy',testingPolicyNote='Snapshot data is not a current testing-policy statement.',source='U.S. Department of Education · College Scorecard',sourceYear=release,sourceUrl=source_url,tuitionInState=integer(r.get('TUITIONFEE_IN')),tuitionOutOfState=integer(r.get('TUITIONFEE_OUT'))))
out.sort(key=lambda r:r['name'])
if len(out)<100:raise SystemExit('Unexpectedly small import; refusing to replace directory')
target=base/'src/features/guidance/scorecardColleges.ts'
compact=[[o[k] for k in ['scorecardId','name','location','state','engineeringUrl','act25','act75','admissionRate','tuitionInState','tuitionOutOfState']] for o in out]
code='// Generated from the official May 2025 College Scorecard snapshot.\nimport type {GuidanceCollege} from "./collegeCatalog";\n'
code+='const rows:Array<[number,string,string,string,string,number|null,number|null,string,number|null,number|null]> = '+json.dumps(compact,ensure_ascii=False,separators=(',',':'))+';\n'
code+='export const SCORECARD_COLLEGES:GuidanceCollege[] = rows.map(([scorecardId,name,location,state,url,act25,act75,admissionRate,tuitionInState,tuitionOutOfState])=>({id:`scorecard-${scorecardId}`,scorecardId,name,shortName:name,location,state,engineeringMajors:[],majorCoverage:"ENGINEERING_GENERAL",description:"Reports engineering graduates in the College Scorecard institution snapshot. Check the university for your exact major and current requirements.",admissionsUrl:url,engineeringUrl:url,sat25:null,sat50:null,sat75:null,act25,act50:null,act75,averageGpa:"Not reported in this import",admissionRate,testingPolicy:"Check current university policy",testingPolicyNote:"Snapshot data is not a current testing-policy statement.",source:"U.S. Department of Education · College Scorecard",sourceYear:'+json.dumps(release)+',sourceUrl:'+json.dumps(source_url)+',tuitionInState,tuitionOutOfState}));\n'
target.write_text(code)
print(f'Imported {len(out)} additional engineering university leads; preserved {len(curated)} curated records.')
