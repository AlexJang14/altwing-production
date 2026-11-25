import copy,datetime as dt,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from content_intelligence.model import *
from content_intelligence.pipeline import *
from content_intelligence.adapters import collect_html,collect_feed,collect_scorecard
from content_intelligence.fetcher import PublicFetcher,FetchFailure,safe_url
NOW='2026-11-21T12:00:00Z';ROOT=Path(__file__).resolve().parents[2]
BASE=json.loads((ROOT/'content/intelligence/published.json').read_text())
REG=json.loads((ROOT/'content/intelligence/sources.json').read_text())
def record():
 r={'id':'opportunity:gtri-2027','legacy_id':'gtri-2027','kind':'internship','facts':{k:None for k in FIELDS},'display':{},'first_discovered_at':NOW,'imported_legacy':True,'last_changed_at':None,'verification':{'status':'legacy_reviewed','last_verified_at':'2026-11-15T00:00:00Z','verified_fields':[],'evidence':[]},'lifecycle':{'status':'cycle_unverified','as_of':'2026-11-21','deadline_precision':'unknown'},'history':[]}
 r['facts'].update(name='Synthetic official program',organization='Synthetic QA organization',disciplines=['mechanical'],grades=[10,11,12],application_url='https://official.example.edu/program',source_url='https://official.example.edu/program');return r
def source():return {'id':'official-test','url':'https://official.example.edu/program','adapter':'html','collection_policy':'approved_public_facts','policy_reference':'https://official.example.edu/terms','allowed_hosts':['official.example.edu'],'allowed_paths':['/'],'coverage':['internship'],'disciplines':sorted(DISCIPLINES),'frequency':'weekly','enabled':True,'required':True,'min_interval_seconds':2,'record_id':'opportunity:gtri-2027','field_rules':[{'field':'name','type':'text','pattern':'(Official Program)'}]}
def registry():return {'schema_version':1,'paid_ai':{'enabled':False,'spending_limit_usd':0},'maximum_requests_per_run':20,'maximum_auto_changed_records':10,'maximum_auto_change_fraction':1,'sources':[source()]}
def observation(facts,sha='a'*64):return {'record_id':record()['id'],'source_id':'official-test','facts':facts,'content_sha256':sha,'evidence':[{'field':k,'source_id':'official-test','url':'https://official.example.edu/program','observed_at':NOW,'content_sha256':sha,'method':'html'} for k in facts]}
class FakeFetcher:
 def __init__(self,body=b'<title>Official Program</title>Official Program',fail=None):self.body=body;self.fail=fail;self.calls=0
 def fetch(self,url,source,method='GET'):
  self.calls+=1
  if self.fail:raise FetchFailure(self.fail)
  return {'data':self.body,'sha256':hashlib.sha256(self.body).hexdigest(),'url':url,'status':200,'content_type':'text/html'}
 def check_url(self,url,source):return PublicFetcher().check_url(url,source)
class Tests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);self.content=self.root/'content';self.out=self.root/'run';self.old=make_snapshot([record()],None,NOW)
  for file,data in [('published.json',self.old),('sources.json',registry()),('health.json',{'schema_version':1,'snapshot_id':self.old['snapshot_id'],'checked_at':None,'sources':{}}),('approved-reviews.json',{'schema_version':1,'decisions':[]})]:atomic_json(self.content/file,data)
 def tearDown(self):self.temp.cleanup()
 def test_bootstrap_full_catalog_shape(self):self.assertGreaterEqual(len(validate_snapshot(BASE)['records']),733);self.assertEqual(len(DISCIPLINES),14)
 def test_registry_covers_all_requested_categories(self):self.assertEqual(set().union(*(set(s['coverage']) for s in validate_registry(REG)['sources'])),KINDS)
 def test_no_secret_query_is_stored(self):
  self.assertNotIn('PRIVATE',safe_url('https://api.data.gov/x?api_key=PRIVATE&id=2'))
  with self.assertRaises(ValueError):canonical_url('https://source.edu/?api_key=PRIVATE')
 def test_checksum_tampering_rejected(self):
  s=copy.deepcopy(self.old);s['records'][0]['facts']['name']='tampered'
  with self.assertRaises(ValueError):validate_snapshot(s)
 def test_duplicate_stable_id(self):
  with self.assertRaises(ValueError):make_snapshot([record(),record()],None,NOW)
 def test_new_canonical_duplicate_not_published(self):
  r=record();s=record();s['id']+='-other';s['imported_legacy']=False
  with self.assertRaises(ValueError):make_snapshot([r,s],None,NOW)
 def test_old_deadline_never_rolls_into_new_cycle(self):
  r=record();r['facts'].update(deadline='2026-02-10',application_cycle='2027')
  with self.assertRaises(ValueError):validate_record(r)
 def test_date_only_deadline_uses_safe_boundary(self):
  r=record();r['facts'].update(deadline='2026-11-21',application_cycle='2026');r['verification']['verified_fields']=['deadline']
  self.assertNotEqual(lifecycle(r,parse_time(NOW))['status'],'archived');self.assertEqual(lifecycle(r,parse_time('2026-11-24T00:00:00Z'))['status'],'archived')
 def test_unknown_opening_not_open_now(self):
  r=record();r['facts'].update(deadline='2027-03-01',application_cycle='2027');r['verification']['verified_fields']=['deadline'];self.assertEqual(lifecycle(r,parse_time(NOW))['status'],'upcoming')
 def test_near_deadline_closing_soon(self):
  r=record();r['facts'].update(deadline='2026-11-25',application_cycle='2026');r['verification']['verified_fields']=['deadline'];self.assertEqual(lifecycle(r,parse_time(NOW))['status'],'closing_soon')
 def test_link_check_does_not_refresh_facts(self):
  report=run(self.content,self.out,'daily',fetcher=FakeFetcher(),now=NOW);self.assertEqual(report['observed_records'],0);self.assertEqual(json.loads((self.out/'candidate.json').read_text())['records'][0]['verification'],record()['verification'])
 def test_failed_source_retains_snapshot_and_marks_health(self):
  before=(self.content/'published.json').read_bytes();r=run(self.content,self.out,fetcher=FakeFetcher(fail='HTTP 503'),now=NOW);self.assertFalse(r['publication_eligible']);publish(self.content,self.out,health_only=True);self.assertEqual(before,(self.content/'published.json').read_bytes());self.assertEqual(json.loads((self.content/'health.json').read_text())['sources']['official-test']['status'],'unavailable')
 def test_incomplete_cannot_publish_even_approval(self):
  run(self.content,self.out,fetcher=FakeFetcher(fail='HTTP 503'),now=NOW)
  with self.assertRaises(ValueError):publish(self.content,self.out,approval=self.old['snapshot_id'])
 def test_complete_atomic_publish_and_rollback(self):
  report=run(self.content,self.out,fetcher=FakeFetcher(),now=NOW);self.assertTrue(report['publication_eligible']);ident=publish(self.content,self.out);self.assertNotEqual(ident,self.old['snapshot_id']);self.assertEqual(json.loads((self.content/'published.json').read_text())['records'][0]['facts']['name'],'Official Program');rollback(self.content,self.old['snapshot_id']);self.assertEqual(validate_snapshot(json.loads((self.content/'published.json').read_text()))['snapshot_id'],self.old['snapshot_id'])
 def test_subsets_never_auto_publish(self):self.assertFalse(run(self.content,self.out,selected=['official-test'],fetcher=FakeFetcher(),now=NOW)['publication_eligible'])
 def test_changed_base_blocks_stale_publish(self):
  run(self.content,self.out,fetcher=FakeFetcher(),now=NOW);changed=record();changed['facts']['name']='Other reviewed name';atomic_json(self.content/'published.json',make_snapshot([changed],self.old['snapshot_id'],NOW))
  with self.assertRaises(ValueError):publish(self.content,self.out)
 def test_candidate_swap_after_report_blocked(self):
  run(self.content,self.out,fetcher=FakeFetcher(),now=NOW);changed=record();changed['facts']['name']='Swapped';atomic_json(self.out/'candidate.json',make_snapshot([changed],self.old['snapshot_id'],NOW))
  with self.assertRaises(ValueError):publish(self.content,self.out)
 def test_critical_grade_change_queued_and_preserved(self):
  candidate,q,_,_=build_candidate(self.old,[observation({'grades':[12]})],NOW,registry());self.assertEqual(candidate['records'][0]['facts']['grades'],record()['facts']['grades']);self.assertEqual(q[0]['type'],'material_change')
 def test_review_hash_stable_across_observation_dates(self):
  a=observation({'grades':[12]});b=copy.deepcopy(a);b['evidence'][0]['observed_at']='2026-11-22T12:00:00Z';self.assertEqual(queue_item('material_change',a,'review')['item_hash'],queue_item('material_change',b,'review')['item_hash'])
 def test_explicit_grade_review_applies_only_exact_payload(self):
  p=observation({'grades':[12]});_,q,_,_=build_candidate(self.old,[p],NOW,registry());candidate,_,_,_=build_candidate(self.old,[p],NOW,registry(),{q[0]['item_hash']});self.assertEqual(candidate['records'][0]['facts']['grades'],[12]);p['facts']['grades']=[9];candidate,q,_,_=build_candidate(self.old,[p],NOW,registry(),{q[0]['item_hash']});self.assertNotEqual(candidate['records'][0]['facts']['grades'],[9])
 def test_conflicting_sources_never_last_writer_wins(self):
  c,q,_,_=build_candidate(self.old,[observation({'name':'First'}),observation({'name':'Second'},'b'*64),observation({'name':'Third'},'c'*64)],NOW,registry());self.assertEqual(c['records'][0]['facts']['name'],record()['facts']['name']);self.assertTrue(any(x['type']=='conflicting_sources' for x in q))
 def test_large_changes_need_review(self):
  reg=registry();reg['maximum_auto_changed_records']=0;c,q,_,limited=build_candidate(self.old,[observation({'name':'Changed'})],NOW,reg);self.assertTrue(limited);self.assertEqual(q[-1]['type'],'change_threshold')
 def test_ambiguous_dates_do_not_guess(self):
  s=source();s['field_rules']=[{'field':'deadline','type':'iso_date','pattern':r'Deadline: (20\d{2}-\d{2}-\d{2})'}];r=collect_html(s,FakeFetcher(b'Deadline: 2027-01-01 and Deadline: 2027-02-02'),NOW);self.assertFalse(r['complete']);self.assertFalse(r['observations'])
 def test_no_year_is_not_an_iso_date(self):
  s=source();s['field_rules']=[{'field':'deadline','type':'iso_date','pattern':'Deadline: (March 1)'}];r=collect_html(s,FakeFetcher(b'Deadline: March 1'),NOW);self.assertFalse(r['complete'])
 def test_new_discovery_is_review_only_and_deduped(self):
  p=observation({'name':'New'});p['record_id']='opportunity:new';c,q,_,_=build_candidate(self.old,[p],NOW,registry());self.assertEqual(len(c['records']),1);self.assertEqual(q[0]['type'],'new_record')
 def test_feed_entities_blocked(self):
  with self.assertRaises(FetchFailure):collect_feed(source(),FakeFetcher(b'<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>'),NOW)
 def test_redirect_or_private_host_blocked(self):
  f=PublicFetcher()
  for url in ['http://official.example.edu/x','https://evil.test/x','https://altwing.org/api/impact/report','https://altwing-engineering-pathways.theanna.chatgpt.site/api/impact/report','https://127.0.0.1/x']:
   with self.assertRaises((FetchFailure,ValueError)):f.check_url(url,source())
 def test_private_fields_rejected(self):
  r=record();r['facts']['email']='sensitive'
  with self.assertRaises(ValueError):validate_record(r)
 def test_verified_status_requires_real_evidence(self):
  r=record();r['verification']['status']='verified'
  with self.assertRaises(ValueError):validate_record(r)
 def test_fake_free_cost_cannot_pass_budget_filter(self):
  r=record();r['display']['costBand']='FREE_PAID'
  with self.assertRaises(ValueError):validate_record(r)
 def test_failed_atomic_replace_keeps_old_file(self):
  p=self.root/'atomic.json';atomic_json(p,{'old':True});old=p.read_bytes()
  with patch('os.replace',side_effect=OSError('Synthetic disk interruption')):
   with self.assertRaises(OSError):atomic_json(p,{'bad':True})
  self.assertEqual(p.read_bytes(),old)
 def test_paid_ai_default_disabled(self):
  reg=registry();reg['paid_ai']={'enabled':True,'spending_limit_usd':100}
  with self.assertRaises(ValueError):validate_registry(reg)
if __name__=='__main__':unittest.main()
