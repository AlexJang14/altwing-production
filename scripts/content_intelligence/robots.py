"""Small fail-closed RFC 9309 path-rule matcher, with Crawl-delay support."""
import math, re
from urllib.parse import urlsplit
UNRESERVED=set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~')
def normalize(text):
    def esc(m):
        char=chr(int(m.group(1),16));return char if char in UNRESERVED else '%'+m.group(1).upper()
    return re.sub(r'%([0-9a-fA-F]{2})',esc,text)
class Robots:
    def __init__(self,text):
        self.groups=[];agents=[];rules=[];delay=0;started=False
        for raw in text.splitlines():
            line=raw.split('#',1)[0].strip()
            if not line or ':' not in line:continue
            key,val=line.split(':',1);key=key.strip().lower();val=val.strip()
            if key=='user-agent':
                if started:self.groups.append((agents,rules,delay));agents=[];rules=[];delay=0;started=False
                agents.append(val.lower())
            elif agents and key in {'allow','disallow'}:
                started=True
                if not val:continue
                if len(val)>2048 or val.count('*')>25:raise ValueError('Robots rule exceeds safe matcher limits')
                terminal=val.endswith('$');value=normalize(val[:-1] if terminal else val)
                pattern='^'+'.*'.join(re.escape(x) for x in value.split('*'))+('$' if terminal else '')
                rules.append((len(value.replace('*','').encode()),key=='allow',re.compile(pattern)))
            elif agents and key=='crawl-delay':
                started=True
                try:
                    seconds=float(val)
                    if not math.isfinite(seconds) or seconds<0:raise ValueError()
                    delay=max(delay,seconds)
                except ValueError:raise ValueError('Invalid crawl delay')
        if agents:self.groups.append((agents,rules,delay))
        if sum(len(g[1]) for g in self.groups)>10000:raise ValueError('Robots rule count exceeds budget')
    def select(self,agent):
        product=agent.split('/',1)[0].lower();matches=[]
        for agents,rules,delay in self.groups:
            specific=max((len(a) for a in agents if a!='*' and a in product),default=-1)
            if specific>=0:matches.append((specific,rules,delay))
        if not matches:matches=[(0,r,d) for a,r,d in self.groups if '*' in a]
        best=max((x[0] for x in matches),default=-1)
        return [(r,d) for score,r,d in matches if score==best]
    def allowed(self,agent,url):
        u=urlsplit(url);target=normalize((u.path or '/')+('?' + u.query if u.query else ''));matched=[]
        for rules,_ in self.select(agent):
            for length,allow,pattern in rules:
                if pattern.search(target):matched.append((length,allow))
        return max(matched,default=(0,True))[1]
    def delay(self,agent):return max((d for _,d in self.select(agent)),default=0)
