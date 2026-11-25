import argparse,json,sys
from pathlib import Path
from .model import validate_snapshot
from .pipeline import run,publish,rollback,validate_registry,stage_review

def main():
    p=argparse.ArgumentParser(description='Public informational content only; default is dry run.');sub=p.add_subparsers(dest='command',required=True)
    r=sub.add_parser('run');r.add_argument('--mode',choices=['daily','weekly','monthly','all'],default='weekly');r.add_argument('--source',action='append');r.add_argument('--demo-scorecard',action='store_true');r.add_argument('--output',default='.sites-runtime/content-intelligence/run')
    sub.add_parser('validate');pub=sub.add_parser('publish');pub.add_argument('--run',required=True);pub.add_argument('--approve-exact-snapshot');pub.add_argument('--health-only',action='store_true');back=sub.add_parser('rollback');back.add_argument('--snapshot',required=True)
    rev=sub.add_parser('stage-review');rev.add_argument('--run',required=True);rev.add_argument('--record',required=True);rev.add_argument('--item',required=True);rev.add_argument('--reviewer',required=True)
    args=p.parse_args();content=Path('content/intelligence')
    if args.command=='run':
        report=run(content,args.output,args.mode,args.source,args.demo_scorecard);print(json.dumps({k:v for k,v in report.items() if k!='source_results'},indent=2));return 0 if report['scope_complete'] else 2
    if args.command=='validate':validate_snapshot(json.loads((content/'published.json').read_text()));validate_registry(json.loads((content/'sources.json').read_text()));print('PASS: public content snapshot, checksum and source registry');return 0
    if args.command=='stage-review':print(stage_review(content,args.run,args.record,args.item,args.reviewer));return 0
    if args.command=='publish':print(publish(content,args.run,args.approve_exact_snapshot,args.health_only));return 0
    print(rollback(content,args.snapshot));return 0
if __name__=='__main__':
    try:sys.exit(main())
    except (ValueError,KeyError,FileNotFoundError) as e:print('Content operation refused: '+str(e),file=sys.stderr);sys.exit(1)
