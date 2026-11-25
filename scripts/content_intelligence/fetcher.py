"""Bounded, allowlisted public fetches. No cookies, login bypass or private API."""
import hashlib, ipaddress, json, os, re, time, urllib.request, urllib.error
from .robots import Robots
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

AGENT='AltWingContentIntelligence/1.0 (+https://altwing.org)'
SENSITIVE={'api_key','apikey','token','access_token','secret','password'}
class FetchFailure(Exception): pass

def safe_url(url):
    u=urlsplit(url);return urlunsplit((u.scheme,u.netloc,u.path,urlencode([(k,v) for k,v in parse_qsl(u.query) if k.lower() not in SENSITIVE]),''))

class PublicFetcher:
    def __init__(self,timeout=20,max_bytes=1500000,max_requests=180):
        self.timeout=timeout;self.max_bytes=max_bytes;self.max_requests=max_requests;self.calls=0;self.last={};self.robots={};self.observations=[]
    def check_url(self,url,source):
        u=urlsplit(url)
        try:ipaddress.ip_address(u.hostname);raise FetchFailure('Literal IP addresses prohibited')
        except ValueError:pass
        if u.scheme!='https' or u.username or u.password or u.port not in (None,443) or u.hostname not in source['allowed_hosts']:raise FetchFailure('URL outside approved official hosts')
        if u.hostname in {'altwing.org','www.altwing.org','localhost'} or u.hostname.endswith(('.chatgpt.site','.local','.internal')):raise FetchFailure('Application/private host prohibited')
        if source['adapter']!='scorecard' and not any(u.path.startswith(p) for p in source.get('allowed_paths',['/'])):raise FetchFailure('URL outside approved paths')
    def _reserve_request(self,url,source):
        if self.calls>=self.max_requests:raise FetchFailure('Per-run request budget exceeded')
        host=urlsplit(url).hostname;interval=max(2,source.get('min_interval_seconds',2));wait=interval-(time.monotonic()-self.last.get(host,0))
        if wait>0:time.sleep(wait)
        self.last[host]=time.monotonic();self.calls+=1
    def _request(self,url,source,method='GET',robots_request=False):
        self.check_url(url,source);self._reserve_request(url,source)
        owner=self
        class Guard(urllib.request.HTTPRedirectHandler):
            def redirect_request(self,req,fp,code,msg,headers,newurl):
                owner.check_url(newurl,source)
                redirect_source=source
                if not robots_request and source['adapter']!='scorecard':redirect_source=owner.robots_allowed(newurl,source)
                if urlsplit(newurl).hostname!=urlsplit(req.full_url).hostname and any(k.lower() in SENSITIVE for k,_ in parse_qsl(urlsplit(req.full_url).query)):raise FetchFailure('Credential redirect prohibited')
                owner._reserve_request(newurl,redirect_source)
                return super().redirect_request(req,fp,code,msg,headers,newurl)
        accept='application/rss+xml,application/atom+xml,application/xml;q=0.9' if source['adapter']=='rss' else 'application/json,text/html;q=0.8,*/*;q=0.1'
        req=urllib.request.Request(url,method=method,headers={'User-Agent':AGENT,'Accept-Encoding':'identity','Accept':accept})
        try:
            with urllib.request.build_opener(Guard()).open(req,timeout=self.timeout) as response:
                data=b'' if method=='HEAD' else response.read(self.max_bytes+1)
                if len(data)>self.max_bytes:raise FetchFailure('Response size limit exceeded')
                result={'status':response.status,'url':safe_url(response.url),'content_type':response.headers.get('Content-Type',''),'last_modified':response.headers.get('Last-Modified'),'sha256':hashlib.sha256(data).hexdigest(),'data':data}
                self.observations.append({k:v for k,v in result.items() if k!='data'});return result
        except urllib.error.HTTPError as exc:
            # Do not retry a 403/challenge through a proxy or alternate identity.
            raise FetchFailure('HTTP '+str(exc.code)) from None
        except (urllib.error.URLError,TimeoutError,OSError):raise FetchFailure('Public source unavailable or timed out') from None
    def robots_allowed(self,url,source):
        u=urlsplit(url);origin=u.scheme+'://'+u.netloc
        if origin not in self.robots:
            probe=dict(source);probe['allowed_paths']=['/robots.txt']
            try:
                response=self._request(origin+'/robots.txt',probe,robots_request=True)
                text=response['data'].decode('utf-8',errors='replace')
                if '<html' in text.lower():raise FetchFailure('Robots response is not a policy file')
                try:self.robots[origin]=Robots(text)
                except ValueError:raise FetchFailure('Unsupported/invalid robots policy; manual review required')
            except FetchFailure as exc:
                if str(exc)=='HTTP 404':self.robots[origin]=None
                else:raise FetchFailure('Robots policy unavailable/denied: '+str(exc)) from None
        robot=self.robots[origin]
        if robot is not None:
            if not robot.allowed(AGENT,url):raise FetchFailure('Robots disallows this path')
            delay=robot.delay(AGENT)
            if delay:
                if delay>30:raise FetchFailure('Crawl delay exceeds run budget; manual scheduling required')
                source=dict(source,min_interval_seconds=max(delay,source.get('min_interval_seconds',2)))
        return source
    def fetch(self,url,source,method='GET'):
        if source['collection_policy'] not in {'official_api','permitted_feed','approved_public_facts'}:raise FetchFailure('Source terms/collection permission needs review')
        if source['adapter']!='scorecard':source=self.robots_allowed(url,source)
        result=self._request(url,source,method)
        if method!='HEAD' and ('html' in result['content_type']):
            text=result['data'][:20000].decode('utf-8',errors='ignore').lower()
            if any(x in text for x in ['cf-chl-','verify you are human','access denied','captcha']):raise FetchFailure('Access challenge; manual review required')
        return result
