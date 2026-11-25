"""Collection -> quarantine -> validated candidate -> explicit atomic publication."""
import copy, datetime as dt, json, os, re
from pathlib import Path
from urllib.parse import urlsplit
from .model import *
from .adapters import collect
from .fetcher import PublicFetcher,FetchFailure

CRITICAL={'grades','age_min','age_max','citizenship','residency','cost','stipend','financial_aid','application_cycle','deadline','opening_date','application_url','accreditation','admissions_requirements','program_information','career_resources'}

def validate_registry(registry):
    if registry.get('schema_version')!=1 or registry.get('paid_ai')!={'enabled':False,'spending_limit_usd':0}:raise ValueError('Paid enrichment is disabled and has no spending authorization')
    ids=set()
    for s in registry['sources']:
        if not re.fullmatch(r'[a-z0-9][a-z0-9_.-]+',s['id']) or s['id'] in ids:raise ValueError('Duplicate/invalid source ID')
        ids.add(s['id']);canonical_url(s['url']);canonical_url(s['policy_reference'])
        if set(s['disciplines'])-DISCIPLINES or set(s['coverage'])-KINDS:raise ValueError('Invalid source scope')
        if s['adapter'] not in {'manual','html','rss','scorecard'}:raise ValueError('Unsupported adapter')
        if s['adapter']=='scorecard' and (s['url']!='https://api.data.gov/ed/collegescorecard/v1/schools' or s.get('credential_env')!='COLLEGE_SCORECARD_API_KEY'):raise ValueError('Scorecard credential can only go to the official endpoint')
        if s['adapter']=='manual' and s['collection_policy']!='manual_review_required':raise ValueError('Manual access cannot be inferred')
        for rule in s.get('field_rules',[]):
            if rule['field'] not in FIELDS or len(rule['pattern'])>500:raise ValueError('Invalid extraction rule')
            if re.compile(rule['pattern']).groups!=1:raise ValueError('Each field rule needs exactly one explicit capture group')
    return registry

def ui_patch(record,observed):
    f=record['facts'];patch=record['display'];fields=set(observed)
    if record['kind']=='college':
        if 'name' in fields:patch['name']=f['name'];patch['shortName']=f['name']
        if 'location' in fields:patch['location']=f['location']
        stats=f.get('statistics')
        if 'statistics' in fields and stats:
            for api,display in [('latest.cost.tuition.in_state','tuitionInState'),('latest.cost.tuition.out_of_state','tuitionOutOfState'),('latest.admissions.act_scores.25th_percentile','act25'),('latest.admissions.act_scores.75th_percentile','act75')]:
                value=stats.get(api)
                if value is not None and (type(value) not in (int,float) or value<0):raise ValueError('Invalid Scorecard statistic')
                if display.startswith('act') and value is not None and not 1<=value<=36:raise ValueError('ACT statistic out of range')
                patch[display]=value
            rate=stats.get('latest.admissions.admission_rate.overall')
            if rate is not None and (type(rate) not in (int,float) or not 0<=rate<=1):raise ValueError('Admission rate out of range')
            patch['admissionRate']=f'{rate*100:.1f}% institution-wide (historical API cohorts)' if rate is not None else 'Not reported by source'
            patch['source']='U.S. Department of Education · College Scorecard API'
            patch['sourceUrl']='https://collegescorecard.ed.gov/data/'
            patch['sourceYear']='Latest returned API fields; cohort years vary and were not supplied. Not current admissions requirements.'
        admissions=f.get('admissions_requirements')
        if 'admissions_requirements' in fields and isinstance(admissions,dict):
            if admissions.get('testing_policy') not in {'REQUIRED','OPTIONAL','NOT_USED','CHECK'}:raise ValueError('Admissions testing policy must be explicit')
            patch['testingPolicy']=admissions['testing_policy'];patch['testingPolicyNote']=admissions.get('note','Check the official admissions source for the full policy.')
        program=f.get('program_information')
        if 'program_information' in fields and isinstance(program,dict) and 'engineering_majors' in program:
            if not isinstance(program['engineering_majors'],list) or set(program['engineering_majors'])-DISCIPLINES:raise ValueError('Exact program list must use known disciplines')
            patch['engineeringMajors']=program['engineering_majors']
    else:
        for fact,display in [('name','title'),('organization','organization'),('location','location'),('format','format'),('cost','cost'),('application_url','officialUrl')]:
            if fact in fields and f.get(fact) is not None:patch[display]=f[fact]
        if 'grades' in fields and f['grades'] is not None:patch['grades']=[str(x) for x in f['grades']]
        if 'deadline' in fields and f.get('deadline'):patch['timing']='Officially posted application deadline: '+f['deadline']+'. Confirm the official page for full conditions.'

def queue_item(kind,payload,reason):
    data={'type':kind,'payload':payload,'reason':reason}
    def stable(v):
        if isinstance(v,dict):return {k:stable(x) for k,x in v.items() if k not in {'observed_at','first_discovered_at'}}
        if isinstance(v,list):return [stable(x) for x in v]
        return v
    return {**data,'item_hash':digest(stable(data)),'decision':'pending'}

def build_candidate(snapshot,observations,now,registry,approved=None):
    validate_snapshot(snapshot,parse_time(now));records={r['id']:copy.deepcopy(r) for r in snapshot['records']};queue=[];changed=set();fact_changes=set();observed={};quarantined=set();approved=approved or set()
    for proposal in observations:
        ident=proposal['record_id']
        if ident in quarantined:continue
        if ident not in records:
            queue.append(queue_item('new_record',proposal,'New identity requires review; never replace a saved stable ID.'));continue
        prior=observed.get(ident)
        if prior and any(k in prior and prior[k]!=v for k,v in proposal['facts'].items()):
            queue.append(queue_item('conflicting_sources',proposal,'Official sources conflict; retained last known record.'));records[ident]=copy.deepcopy(next(r for r in snapshot['records'] if r['id']==ident));changed.discard(ident);fact_changes.discard(ident);quarantined.add(ident);continue
        observed.setdefault(ident,{}).update(proposal['facts'])
        r=records[ident];differences={k:[r['facts'].get(k),v] for k,v in proposal['facts'].items() if r['facts'].get(k)!=v}
        critical={k:v for k,v in differences.items() if k in CRITICAL}
        item=queue_item('material_change',proposal,'Eligibility/cycle/deadline/cost/application or accreditation change needs explicit review.')
        if critical and item['item_hash'] not in approved:queue.append(item);continue
        before=copy.deepcopy(r)
        r['facts'].update(proposal['facts'])
        # Evidence is field-specific. A reachable URL alone never verifies facts.
        proven={e['field'] for e in proposal['evidence']}
        if not proven>=set(proposal['facts']):raise ValueError('Fact change lacks field evidence')
        v=r['verification'];v['verified_fields']=sorted(set(v['verified_fields'])|proven);v['last_verified_at']=now
        existing={e['field']:e for e in v['evidence']};existing.update({e['field']:e for e in proposal['evidence']});v['evidence']=list(existing.values())
        known={k for k,val in r['facts'].items() if val is not None};v['status']='verified' if known<=set(v['verified_fields']) else 'partially_verified'
        ui_patch(r,proposal['facts']);validate_record(r,parse_time(now))
        if differences:fact_changes.add(ident);r['last_changed_at']=now;r['history'].append({'at':now,'event':'verified_fact_change','fields':sorted(differences),'source_id':proposal['source_id'],'previous_record_sha256':digest(before)})
        if r!=before:changed.add(ident)
    for r in records.values():
        life=lifecycle(r,parse_time(now))
        if life['status']!=r['lifecycle']['status'] or life['deadline_precision']!=r['lifecycle']['deadline_precision']:
            r['lifecycle']=life;r['history'].append({'at':now,'event':'deterministic_deadline_status','status':life['status']})
    # Rechecking identical facts changes evidence timestamps, not substantive
    # information. Counting those renewals would block every complete API poll.
    threshold=len(fact_changes)>registry['maximum_auto_changed_records'] or len(fact_changes)/max(1,len(records))>registry['maximum_auto_change_fraction']
    if threshold:queue.append(queue_item('change_threshold',{'fact_changed_records':len(fact_changes)},'Batch exceeds automatic-change threshold; explicit whole-candidate review required.'))
    current=list(records.values());candidate=make_snapshot(current,snapshot['snapshot_id'],now) if sorted(current,key=lambda r:r['id'])!=snapshot['records'] else copy.deepcopy(snapshot)
    return candidate,queue,changed,threshold

def run(content_dir,output_dir,mode='weekly',selected=None,demo=False,fetcher=None,now=None):
    content=Path(content_dir);out=Path(output_dir);now=now or utcnow();snapshot=validate_snapshot(json.loads((content/'published.json').read_text()),parse_time(now));registry=validate_registry(json.loads((content/'sources.json').read_text()));previous_health=json.loads((content/'health.json').read_text())
    decisions=json.loads((content/'approved-reviews.json').read_text()).get('decisions',[])
    approved=set()
    for d in decisions:
        if d.get('decision')=='approve' and d.get('reviewer')=='AlexJang14' and d.get('evidence_url') and d.get('reviewed_at'):
            canonical_url(d['evidence_url']);parse_time(d['reviewed_at']);approved.add(d['item_hash'])
    fetcher=fetcher or PublicFetcher(max_requests=registry['maximum_requests_per_run']);health=copy.deepcopy(previous_health.get('sources',{}));observations=[];discoveries=[];queue=[];failures=[];expected=[];succeeded=[];source_results=[]
    scopes={'daily':{'weekly','monthly'},'weekly':{'weekly'},'monthly':{'monthly'},'all':{'weekly','monthly'}}[mode]
    for source in registry['sources']:
        if not source['enabled'] and source.get('required') and source['adapter']!='manual' and source['frequency'] in scopes and not (mode=='daily' and source['adapter']=='scorecard') and (not selected or source['id'] in selected):
            failures.append({'source_id':source['id'],'reason':source.get('disabled_reason','Required source disabled pending verification/configuration')})
        if not source['enabled'] or source['frequency'] not in scopes or (selected and source['id'] not in selected):continue
        if source['adapter']=='manual':
            health[source['id']]={**health.get(source['id'],{}),'status':'manual_review_required','record_id':source.get('record_id'),'last_attempt_at':now,'reason':'No approved automated access/parser; no request made.'};continue
        if mode=='daily' and source['adapter']=='scorecard':continue
        expected.append(source['id']);old=health.get(source['id'],{})
        try:
            if mode=='daily':
                try:response=fetcher.fetch(source['url'],source,method='HEAD')
                except FetchFailure as exc:
                    if str(exc) not in {'HTTP 405','HTTP 501'}:raise
                    response=fetcher.fetch(source['url'],source)
                record=next((r for r in snapshot['records'] if r['id']==source.get('record_id')),None)
                if record and canonical_url(record['facts']['application_url'])!=canonical_url(source['url']):fetcher.fetch(record['facts']['application_url'],source,method='HEAD')
                result={'observations':[],'discoveries':[],'complete':True,'link_status':response['status']}
            else:result=collect(source,fetcher,now,demo)
            source_results.append({'source_id':source['id'],**result});observations.extend(result.get('observations',[]));discoveries.extend(result.get('discoveries',[]))
            if result.get('complete'):succeeded.append(source['id'])
            else:failures.append({'source_id':source['id'],'reason':result.get('reason','Extraction incomplete or ambiguous')})
            health[source['id']]={**old,'record_id':source.get('record_id'),'status':'ok' if result.get('complete') else 'incomplete','last_attempt_at':now,'last_success_at':now if result.get('complete') else old.get('last_success_at'),'content_sha256':result.get('content_sha256',old.get('content_sha256'))}
            if mode=='daily':
                # Link reachability cannot clear a failed fact parser or advance
                # a factual collection timestamp. Keep those checks independent.
                health[source['id']]={**old,'record_id':source.get('record_id'),'status':old.get('status','link_checked'),'last_link_check_at':now,'link_status':response['status'],'link_failure':None}
            if result.get('ambiguous_fields'):queue.append(queue_item('ambiguous_source',{'source_id':source['id'],'fields':result['ambiguous_fields']},'Missing/conflicting explicit source fields; old facts retained.'))
            if source['adapter']=='html' and result.get('content_sha256')!=old.get('content_sha256') and not result.get('observations'):
                queue.append(queue_item('source_page_changed',{'source_id':source['id'],'source_url':source['url'],'content_sha256':result.get('content_sha256')},'Public page observed/changed, but no approved field-level extractor; no fact refresh inferred.'))
        except Exception as exc:
            reason=str(exc) if isinstance(exc,FetchFailure) else 'Parser/validation failure ('+type(exc).__name__+')'
            failures.append({'source_id':source['id'],'reason':reason});health[source['id']]={**old,'record_id':source.get('record_id'),'status':'unavailable','last_attempt_at':now,'last_success_at':old.get('last_success_at'),'reason':reason}
            if mode=='daily':health[source['id']]={**old,'record_id':source.get('record_id'),'last_link_check_at':now,'link_status':None,'link_failure':reason}
    try:
        candidate,q,changed,threshold=build_candidate(snapshot,observations,now,registry,approved);queue.extend(q)
    except ValueError as exc:
        candidate=copy.deepcopy(snapshot);changed=set();threshold=True
        failures.append({'source_id':'candidate-validation','reason':str(exc)})
        queue.append(queue_item('invalid_candidate',{'reason':str(exc)},'Invalid extraction quarantined; no published data changed.'))
        for sid in {o['source_id'] for o in observations}:health[sid]={**health.get(sid,{}),'status':'incomplete','reason':'Candidate validation rejected extracted facts'}
    old_queue=json.loads((content/'review-queue.json').read_text()).get('items',[]) if (content/'review-queue.json').exists() else []
    known_discoveries=set()
    for d in discoveries:
        if d['key'] not in known_discoveries:queue.append(queue_item('discovery',d,d['reason']));known_discoveries.add(d['key'])
    rejected={d.get('item_hash') for d in decisions if d.get('decision')=='reject' and d.get('reviewer')=='AlexJang14' and d.get('reviewed_at')}
    pending={i['item_hash']:i for i in old_queue if i['item_hash'] not in rejected|approved}
    for item in queue:
        if item['item_hash'] not in rejected|approved:pending.setdefault(item['item_hash'],item)
    queue=list(pending.values())
    complete=bool(expected) and not failures and set(expected)==set(succeeded)
    eligible=complete and not threshold and not selected and not demo
    old_records={r['id']:r for r in snapshot['records']};changes=[];stale=[];machine_stale=[]
    for r in candidate['records']:
        before=old_records.get(r['id'])
        if before and before['facts']!=r['facts']:
            changes.append({'id':r['id'],'fields':{k:{'before':before['facts'].get(k),'after':v} for k,v in r['facts'].items() if before['facts'].get(k)!=v}})
        last=parse_time(r['verification']['last_verified_at'])
        if last and (parse_time(now)-last).days>(45 if r['kind'] in {'college','major','career_resource'} else 14):
            stale.append(r['id'])
            if r['verification']['verified_fields']:machine_stale.append(r['id'])
    for result in source_results:
        if result['source_id']=='college-scorecard' and result.get('complete'):
            found={o['record_id'] for o in result['observations']}
            missing=[r['id'] for r in snapshot['records'] if r['id'].startswith('college:scorecard-') and r['id'] not in found]
            if missing:queue.append(queue_item('unexpected_disappearance',{'source_id':'college-scorecard','record_ids':missing},'Records absent from a complete official result remain retained and need review; no automatic deletion.'))
    queue=list({i['item_hash']:i for i in queue if i['item_hash'] not in rejected|approved}.values())
    report={'schema_version':1,'mode':mode,'at':now,'base_snapshot_id':snapshot['snapshot_id'],'candidate_snapshot_id':candidate['snapshot_id'],'scope_complete':complete,'publication_eligible':eligible,'dry_run':True,'selected_sources':selected,'expected_sources':expected,'succeeded_sources':succeeded,'failures':failures,'manual_sources':sum(s['adapter']=='manual' for s in registry['sources']),'disabled_sources':sum(not s['enabled'] for s in registry['sources']),'observed_records':len(observations),'changed_records':len(changed),'fact_changed_records':len(changes),'review_items':len(queue),'new_discoveries':len(known_discoveries),'records_retained':len(candidate['records']),'records_deleted':0,'request_count':fetcher.calls,'threshold_exceeded':threshold,'source_results':source_results,'paid_ai_used':False,'production_database_access':False,'changes':changes,'stale_record_ids':stale,'stale_machine_record_ids':machine_stale,'unknown_or_legacy_only_records':sum(not r['verification']['verified_fields'] for r in candidate['records'])}
    out.mkdir(parents=True,exist_ok=True)
    atomic_json(out/'candidate.json',candidate);atomic_json(out/'review-queue.json',{'schema_version':1,'base_snapshot_id':snapshot['snapshot_id'],'items':queue});atomic_json(out/'report.json',report)
    atomic_json(out/'health.json',{'schema_version':1,'snapshot_id':snapshot['snapshot_id'],'checked_at':now,'sources':health})
    md=['# AltWing public content dry run',f'UTC: {now}',f'Mode: {mode}',f'Observed records: {len(observations)}; fact/verification changes: {len(changed)}; review items: {len(queue)}.',f'Collection complete: {complete}; eligible for automatic fact publication: {eligible}.',f'{len(candidate["records"])} records retained; no deletions; no student/backend data accessed.','', '## Source results']
    md += [f'- {ident}: '+('complete' if ident in succeeded else 'BLOCKED/incomplete') for ident in expected]
    md += ['', '## Proposed verified field changes']+[f'- {c["id"]}: '+', '.join(c['fields']) for c in changes]
    md += ['', f'Stale records: {len(stale)}; previously machine-verified stale records: {len(machine_stale)}. Unknown/legacy-only records are not represented as current verifications.']
    md += ['', '## Failures']+[f'- {f["source_id"]}: {f["reason"]}' for f in failures]
    md += ['', '## Limits','A link/robots check is not fact verification. Imported dates are not new source verification. Scorecard statistics may use different historical cohorts. Discovery items are not published opportunities. Manual sources require an approved access policy/parser.']
    (out/'report.md').write_text('\n'.join(md)+'\n')
    return report

def publish(content_dir,run_dir,approval=None,health_only=False):
    content=Path(content_dir);out=Path(run_dir);old=validate_snapshot(json.loads((content/'published.json').read_text()));report=json.loads((out/'report.json').read_text());candidate=validate_snapshot(json.loads((out/'candidate.json').read_text()))
    if report['candidate_snapshot_id']!=candidate['snapshot_id']:raise ValueError('Candidate changed after validation/report creation')
    if report['base_snapshot_id']!=old['snapshot_id']:raise ValueError('Published snapshot changed during collection; refusing stale overwrite')
    if not health_only and (not report['publication_eligible'] and approval!=candidate['snapshot_id']):raise ValueError('Incomplete/threshold/subset/probe run cannot publish facts without exact explicit candidate review')
    if not report['scope_complete'] and not health_only:raise ValueError('Incomplete collections cannot replace published facts, even with an approval hash')
    if {r['id'] for r in old['records']}-{r['id'] for r in candidate['records']}:raise ValueError('Unexpected deletion prohibited; archive instead')
    if not health_only and candidate['snapshot_id']!=old['snapshot_id']:
        atomic_json(content/'history'/(old['snapshot_id']+'.json'),old);atomic_json(content/'published.json',candidate)
    review=json.loads((out/'review-queue.json').read_text());atomic_json(content/'review-queue.json',review)
    health=json.loads((out/'health.json').read_text());health['snapshot_id']=old['snapshot_id'] if health_only else candidate['snapshot_id'];atomic_json(content/'health.json',health)
    return health['snapshot_id']

def rollback(content_dir,ident):
    if not re.fullmatch(r'[a-f0-9]{64}',ident):raise ValueError('Exact snapshot hash required')
    content=Path(content_dir);old=validate_snapshot(json.loads((content/'published.json').read_text()));prior=validate_snapshot(json.loads((content/'history'/(ident+'.json')).read_text()))
    # Intentional content rollback never touches app data, progress or migration.
    atomic_json(content/'history'/(old['snapshot_id']+'.json'),old);atomic_json(content/'published.json',prior);atomic_json(content/'health.json',{'schema_version':1,'snapshot_id':ident,'checked_at':None,'sources':{}})
    return ident

def stage_review(content_dir,run_dir,record_file,item_hash,reviewer):
    """An explicit human record review, separate from automated collection.

    Creates a candidate only. It never publishes, pushes or changes a live site.
    The next step requires the exact candidate hash and a reviewed Git PR.
    """
    if reviewer!='AlexJang14':raise ValueError('Owner review label required; GitHub PR authorization remains authoritative')
    content=Path(content_dir);out=Path(run_dir);old=validate_snapshot(json.loads((content/'published.json').read_text()));registry=validate_registry(json.loads((content/'sources.json').read_text()))
    queue=json.loads((out/'review-queue.json').read_text())
    if queue['base_snapshot_id']!=old['snapshot_id']:raise ValueError('Stale review queue; rerun from the current published snapshot before review')
    item=next((x for x in queue['items'] if x['item_hash']==item_hash),None)
    if not item:raise ValueError('Exact queued item not found')
    record=validate_record(json.loads(Path(record_file).read_text()));record=copy.deepcopy(record)
    known={s['id']:s for s in registry['sources']}
    for e in record['verification']['evidence']:
        if e['source_id'] not in known or urlsplit(e['url']).hostname not in known[e['source_id']]['allowed_hosts']:raise ValueError('Human evidence must reference registered official sources')
    if record['verification']['status'] not in {'verified','partially_verified'}:raise ValueError('Review must identify which factual fields were actually verified')
    rows={r['id']:r for r in old['records']};record['history'].append({'at':utcnow(),'event':'explicit_owner_content_review','queue_item':item_hash,'reviewer':reviewer});rows[record['id']]=record
    candidate=make_snapshot(list(rows.values()),old['snapshot_id'],utcnow());report={'schema_version':1,'mode':'explicit_manual_review','at':utcnow(),'base_snapshot_id':old['snapshot_id'],'candidate_snapshot_id':candidate['snapshot_id'],'scope_complete':True,'publication_eligible':False,'dry_run':True,'reviewed_record':record['id'],'reviewer':reviewer,'records_deleted':0}
    atomic_json(out/'candidate.json',candidate);atomic_json(out/'report.json',report);atomic_json(out/'review-queue.json',{'schema_version':1,'base_snapshot_id':old['snapshot_id'],'items':[x for x in queue['items'] if x['item_hash']!=item_hash]});atomic_json(out/'health.json',json.loads((content/'health.json').read_text()))
    return candidate['snapshot_id']
