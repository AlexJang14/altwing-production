"""Isolated public-source protocol and human-review regressions; no live requests."""
import copy, hashlib, json, os, sys, unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from content_intelligence.robots import Robots
from content_intelligence.fetcher import PublicFetcher, FetchFailure, AGENT
from content_intelligence.adapters import collect_scorecard, collect_feed
from content_intelligence.model import atomic_json, make_snapshot, validate_record, parse_time
from content_intelligence.pipeline import run, publish, stage_review, build_candidate
import test_pipeline as fx

def college_record():
 r=fx.record();r.update(id='college:scorecard-100654',legacy_id='scorecard-100654',kind='college');r['facts'].update(name='Synthetic Engineering College',organization='Synthetic College');return r

class RobotsTests(unittest.TestCase):
 def test_wildcards_terminal_and_specific_allow(self):
  r=Robots('User-agent: *\nDisallow: /*?\nDisallow: /private/\nAllow: /private/public$')
  self.assertTrue(r.allowed(AGENT,'https://official.example.edu/ooh/'))
  self.assertFalse(r.allowed(AGENT,'https://official.example.edu/ooh/?x=1'))
  self.assertTrue(r.allowed(AGENT,'https://official.example.edu/private/public'))
  self.assertFalse(r.allowed(AGENT,'https://official.example.edu/private/public/more'))
 def test_allow_wins_equal_specificity(self):
  self.assertTrue(Robots('User-agent: *\nDisallow: /same\nAllow: /same').allowed(AGENT,'https://x.edu/same'))
 def test_specific_group_and_equal_groups_combine(self):
  r=Robots('User-agent: *\nDisallow: /\nUser-agent: AltWingContentIntelligence\nDisallow: /a\nUser-agent: AltWingContentIntelligence\nDisallow: /b')
  self.assertTrue(r.allowed(AGENT,'https://x.edu/public'))
  self.assertFalse(r.allowed(AGENT,'https://x.edu/a'))
  self.assertFalse(r.allowed(AGENT,'https://x.edu/b'))
 def test_percent_encoding_unreserved_and_reserved(self):
  r=Robots('User-agent: *\nDisallow: /~user\nDisallow: /escaped%2Fpath')
  self.assertFalse(r.allowed(AGENT,'https://x.edu/%7euser'))
  self.assertFalse(r.allowed(AGENT,'https://x.edu/escaped%2fpath'))
  self.assertTrue(r.allowed(AGENT,'https://x.edu/escaped/path'))
 def test_delay_groups_and_invalid_delays_fail_closed(self):
  r=Robots('User-agent: *\nCrawl-delay: 7\nUser-agent: AltWingContentIntelligence\nCrawl-delay: 3')
  self.assertEqual(r.delay(AGENT),3)
  for value in ['NaN','Infinity','-3','nonsense']:
   with self.subTest(value=value), self.assertRaises(ValueError):Robots('User-agent: *\nCrawl-delay: '+value)
 def test_robots_denial_and_delay_are_enforced(self):
  fetch=PublicFetcher();fetch.robots['https://official.example.edu']=Robots('User-agent: *\nDisallow: /private\nCrawl-delay: 9')
  with self.assertRaises(FetchFailure):fetch.robots_allowed('https://official.example.edu/private',fx.source())
  self.assertEqual(fetch.robots_allowed('https://official.example.edu/program',fx.source())['min_interval_seconds'],9)
 def test_redirects_count_toward_request_budget_and_host_rate(self):
  url='https://official.example.edu/program';source=fx.source()
  class Response:
   status=200;headers={};url='https://official.example.edu/redirected'
   def __enter__(self):return self
   def __exit__(self,*args):return False
   def read(self,size):return b'public synthetic page'
  def opener(handler):
   def opened(req,timeout):handler.redirect_request(req,None,302,'Found',{},Response.url);return Response()
   return SimpleNamespace(open=opened)
  fetch=PublicFetcher(max_requests=2);fetch.robots['https://official.example.edu']=None
  with patch('urllib.request.build_opener',side_effect=opener),patch('time.monotonic',return_value=100),patch('time.sleep') as sleep:
   fetch._request(url,source);self.assertEqual(fetch.calls,2);sleep.assert_called_with(2)
  fetch=PublicFetcher(max_requests=1);fetch.robots['https://official.example.edu']=None
  with patch('urllib.request.build_opener',side_effect=opener),self.assertRaises(FetchFailure):fetch._request(url,source)
 def test_literal_addresses_denied_even_if_allowlisted(self):
  for host in ['127.0.0.1','8.8.8.8','[::1]']:
   s=fx.source();s['allowed_hosts']=[host.strip('[]')]
   with self.subTest(host=host), self.assertRaises(FetchFailure):PublicFetcher().check_url('https://'+host+'/program',s)

class SourceTests(unittest.TestCase):
 def scorecard(self):return next(copy.deepcopy(s) for s in fx.REG['sources'] if s['adapter']=='scorecard')
 def row(self,i):return {'id':i,'school.name':'Synthetic Engineering College '+str(i),'school.city':'Test city','school.state':'GA','latest.academics.program_percentage.engineering':0.1}
 def fetcher(self,pages):
  class Pages:
   def __init__(self):self.calls=0
   def fetch(self,url,source):
    self.calls+=1;page=int(parse_qs(urlsplit(url).query)['page'][0]);raw=json.dumps(pages[page]).encode()
    return {'data':raw,'sha256':hashlib.sha256(raw).hexdigest(),'url':url}
  return Pages()
 def test_complete_pagination_collects_all_ids(self):
  f=self.fetcher([{'metadata':{'total':3},'results':[self.row(1),self.row(2)]},{'metadata':{'total':3},'results':[self.row(3)]}])
  with patch.dict(os.environ,{'COLLEGE_SCORECARD_API_KEY':'SYNTHETIC_NOT_A_CREDENTIAL'}):r=collect_scorecard(self.scorecard(),f,fx.NOW)
  self.assertTrue(r['complete']);self.assertEqual(f.calls,2);self.assertEqual(len(r['observations']),3)
  self.assertTrue(all('api_key' not in e['url'] for row in r['observations'] for e in row['evidence']))
 def test_incomplete_changed_or_duplicate_pagination_withholds_all(self):
  for second in [{'metadata':{'total':2},'results':[]},{'metadata':{'total':3},'results':[self.row(2)]},{'metadata':{'total':2},'results':[self.row(1)]}]:
   with self.subTest(second=second),patch.dict(os.environ,{'COLLEGE_SCORECARD_API_KEY':'SYNTHETIC_NOT_A_CREDENTIAL'}),self.assertRaises(FetchFailure):collect_scorecard(self.scorecard(),self.fetcher([{'metadata':{'total':2},'results':[self.row(1)]},second]),fx.NOW)
 def test_demo_is_always_incomplete_and_key_is_not_stored(self):
  with patch.dict(os.environ,{},clear=True):r=collect_scorecard(self.scorecard(),self.fetcher([{'metadata':{'total':2},'results':[self.row(1)]}]),fx.NOW,demo=True)
  self.assertFalse(r['complete']);self.assertNotIn('DEMO_KEY',json.dumps(r))
 def test_missing_key_never_silently_falls_back_to_public_demo(self):
  with patch.dict(os.environ,{},clear=True),self.assertRaises(FetchFailure):collect_scorecard(self.scorecard(),self.fetcher([]),fx.NOW)
 def test_non_feed_response_is_rejected(self):
  with self.assertRaises(FetchFailure):collect_feed(fx.source(),fx.FakeFetcher(b'<html><title>Not a feed</title></html>'),fx.NOW)

class ReviewTests(unittest.TestCase):
 def setUp(self):fx.Tests.setUp(self)
 def tearDown(self):fx.Tests.tearDown(self)
 def test_disabled_required_monthly_source_is_not_reported_as_complete(self):
  reg=fx.registry();reg['sources'][0].update(enabled=False,frequency='monthly',disabled_reason='Free key/full pagination pending');atomic_json(self.content/'sources.json',reg)
  report=run(self.content,self.out,'monthly',fetcher=fx.FakeFetcher(),now=fx.NOW)
  self.assertFalse(report['scope_complete']);self.assertFalse(report['publication_eligible']);self.assertEqual(report['request_count'],0);self.assertIn('pending',report['failures'][0]['reason'])
 def test_disabled_manual_sources_are_not_fetched_or_counted_as_verified(self):
  reg=fx.registry();reg['sources'][0].update(enabled=False,adapter='manual',collection_policy='manual_review_required');atomic_json(self.content/'sources.json',reg)
  report=run(self.content,self.out,fetcher=fx.FakeFetcher(),now=fx.NOW)
  self.assertEqual(report['request_count'],0);self.assertEqual(report['manual_sources'],1);self.assertEqual(report['disabled_sources'],1);self.assertFalse(report['publication_eligible'])
 def test_daily_success_does_not_clear_failed_fact_parser(self):
  atomic_json(self.content/'health.json',{'schema_version':1,'snapshot_id':self.old['snapshot_id'],'sources':{'official-test':{'status':'incomplete','last_success_at':'2026-11-01T00:00:00Z','reason':'Ambiguous source fields'}}})
  run(self.content,self.out,'daily',fetcher=fx.FakeFetcher(),now=fx.NOW)
  h=json.loads((self.out/'health.json').read_text())['sources']['official-test']
  self.assertEqual(h['status'],'incomplete');self.assertEqual(h['last_success_at'],'2026-11-01T00:00:00Z');self.assertEqual(h['link_status'],200)
 def test_pending_disappearance_reviews_do_not_duplicate_each_run(self):
  s=self.scorecard_source=next(copy.deepcopy(s) for s in fx.REG['sources'] if s['adapter']=='scorecard');s['enabled']=True;reg=fx.registry();reg['sources']=[s];atomic_json(self.content/'sources.json',reg)
  old=college_record()
  snap=make_snapshot([old],None,fx.NOW);atomic_json(self.content/'published.json',snap)
  result={'observations':[],'discoveries':[],'complete':True}
  for i in range(2):
   with patch('content_intelligence.pipeline.collect',return_value=result):run(self.content,self.out,'monthly',fetcher=fx.FakeFetcher(),now=fx.NOW)
   atomic_json(self.content/'review-queue.json',json.loads((self.out/'review-queue.json').read_text()))
  self.assertEqual(len(json.loads((self.out/'review-queue.json').read_text())['items']),1)
 def test_human_review_new_record_preserves_existing_and_needs_exact_approval(self):
  observation=fx.observation({'name':'New official program'});observation['record_id']='opportunity:new-official-program'
  with patch('content_intelligence.pipeline.collect',return_value={'complete':True,'observations':[observation],'discoveries':[]}):run(self.content,self.out,fetcher=fx.FakeFetcher(),now=fx.NOW)
  item=json.loads((self.out/'review-queue.json').read_text())['items'][0]
  reviewed=fx.record();reviewed.update(id=observation['record_id'],legacy_id='new-official-program',imported_legacy=False)
  reviewed['facts'].update(name='New official program',application_url='https://official.example.edu/new-program',source_url='https://official.example.edu/new-program')
  reviewed['verification']={'status':'partially_verified','last_verified_at':fx.NOW,'verified_fields':['name'],'evidence':[observation['evidence'][0]]}
  file=self.root/'reviewed.json';atomic_json(file,reviewed)
  ident=stage_review(self.content,self.out,file,item['item_hash'],'AlexJang14')
  with self.assertRaises(ValueError):publish(self.content,self.out)
  self.assertEqual(publish(self.content,self.out,approval=ident),ident)
  records=json.loads((self.content/'published.json').read_text())['records'];self.assertEqual(len(records),2);self.assertEqual(next(r for r in records if r['id']==fx.record()['id']),self.old['records'][0])
 def test_cross_year_date_requires_same_explicit_official_cycle_evidence(self):
  r=fx.record();r['facts'].update(deadline='2026-12-20',application_cycle='2027');proof=fx.observation({'deadline':'2026-12-20','application_cycle':'2027'})
  r['verification']={'status':'partially_verified','last_verified_at':fx.NOW,'verified_fields':['deadline','application_cycle'],'evidence':proof['evidence']};validate_record(r,parse_time(fx.NOW))
  r['verification']['evidence'][1]['content_sha256']='b'*64
  with self.assertRaises(ValueError):validate_record(r,parse_time(fx.NOW))
 def test_admissions_update_requires_review_and_source_proof(self):
  old=college_record();snap=make_snapshot([old],None,fx.NOW)
  p=fx.observation({'admissions_requirements':{'testing_policy':'OPTIONAL','note':'Synthetic current-cycle policy test'}});p['record_id']=old['id']
  c,q,_,_=build_candidate(snap,[p],fx.NOW,fx.registry());self.assertEqual(c['records'][0]['display'],{});self.assertEqual(q[0]['type'],'material_change')
  c,_,_,_=build_candidate(snap,[p],fx.NOW,fx.registry(),{q[0]['item_hash']});self.assertEqual(c['records'][0]['display']['testingPolicy'],'OPTIONAL')
 def test_evidence_only_renewal_does_not_exceed_substantive_change_limit(self):
  proposal=fx.observation({'name':'Verified title'});first,_,_,_=build_candidate(self.old,[proposal],fx.NOW,fx.registry())
  reg=fx.registry();reg['maximum_auto_changed_records']=0;second,_,changed,limited=build_candidate(first,[proposal],'2026-11-22T12:00:00Z',reg)
  self.assertFalse(limited);self.assertEqual(len(changed),1);self.assertEqual(first['records'][0]['facts'],second['records'][0]['facts'])
 def test_incomplete_verification_cannot_claim_every_field_is_verified(self):
  r=fx.record();r['verification']['status']='partially_verified'
  with self.assertRaises(ValueError):validate_record(r)
  r['verification']={'status':'verified','last_verified_at':fx.NOW,'verified_fields':['name'],'evidence':fx.observation({'name':r['facts']['name']})['evidence']}
  with self.assertRaises(ValueError):validate_record(r)
 def test_malformed_structured_fields_and_unbacked_ui_overrides_blocked(self):
  for field,value in [('statistics',[]),('admissions_requirements','optional'),('program_information',{'engineering_majors':['invented']}),('career_resources','unknown')]:
   r=fx.record();r['facts'][field]=value
   with self.subTest(field=field),self.assertRaises(ValueError):validate_record(r)
  r=fx.record();r['display']['title']={'bad':'UI object'}
  with self.assertRaises(ValueError):validate_record(r)
