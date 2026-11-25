#!/usr/bin/env python3
import sys
from content_intelligence.cli import main
if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,KeyError,FileNotFoundError) as e:print('Content operation refused: '+str(e),file=sys.stderr);raise SystemExit(1)
