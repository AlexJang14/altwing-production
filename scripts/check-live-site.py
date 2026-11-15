"""Read-only acceptance probe for the independent frontend and original site.

Runs HTTP/asset and CORS checks, not a browser interaction test. No private
reports are read and no analytics events are submitted.
"""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
import argparse
import json
import urllib.request
import urllib.error

parser = argparse.ArgumentParser()
parser.add_argument('--target', choices=['preview', 'custom'], default='preview')
parser.add_argument('--skip-cors', action='store_true', help='Check frontend readiness before applying the backend origin update.')
parser.add_argument('--output', default='.sites-runtime/migration-validation/live-site.json')
args = parser.parse_args()
base = 'https://alexjang14.github.io/altwing-production/' if args.target == 'preview' else 'https://altwing.org/'
directory = Path('pages-preview' if args.target == 'preview' else 'pages-dist')
backend = 'https://altwing-engineering-pathways.theanna.chatgpt.site'
results = []


def request(url, method='GET', headers=None):
    req = urllib.request.Request(url, method=method, headers={'User-Agent': 'AltWing-Migration-Verification/1.0', **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, response.geturl(), dict(response.headers), response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.geturl(), dict(error.headers), error.read()


def check_asset(file):
    relative = file.relative_to(directory).as_posix()
    url = base + ('' if relative == 'index.html' else relative)
    try:
        status, final, headers, body = request(url)
        expected = file.read_bytes()
        return {'name': relative, 'status': status, 'url': final, 'passed': status == 200 and body == expected,
                'sha256': sha256(body).hexdigest(), 'expectedSha256': sha256(expected).hexdigest()}
    except Exception as error:
        return {'name': relative, 'passed': False, 'error': str(error)}


files = [file for file in directory.rglob('*') if file.is_file() and file.name not in ['.nojekyll', 'CNAME']]
if not files:
    raise SystemExit('Build the selected Pages target before running the live probe.')
with ThreadPoolExecutor(max_workers=8) as pool:
    results.extend(pool.map(check_asset, sorted(files)))

status, final, headers, body = request('https://junjang06.github.io/altwing/')
original = Path('/tmp/altwing-current-live.html')
results.append({'name': 'old deployment remains available', 'status': status, 'url': final,
                'passed': status == 200 and final == 'https://junjang06.github.io/altwing/'
                and (not original.exists() or original.read_bytes() == body)})

if not args.skip_cors:
    origins = ['https://junjang06.github.io', 'https://alexjang14.github.io', 'https://altwing.org', 'https://www.altwing.org']
    for origin in origins:
        status, final, headers, body = request(backend + '/api/analytics/session', method='OPTIONS', headers={'Origin': origin, 'Access-Control-Request-Method': 'POST'})
        normalized = {key.lower(): value for key, value in headers.items()}
        results.append({'name': 'analytics preflight', 'origin': origin, 'status': status,
                        'passed': status == 204 and normalized.get('access-control-allow-origin') == origin
                        and 'access-control-allow-credentials' not in normalized})
    for origin in ['https://altwing.org.evil.test', 'https://alexjang14.github.io.evil.test', 'http://altwing.org']:
        status, final, headers, body = request(backend + '/api/analytics/session', method='OPTIONS', headers={'Origin': origin, 'Access-Control-Request-Method': 'POST'})
        normalized = {key.lower(): value for key, value in headers.items()}
        results.append({'name': 'reject origin lookalike', 'origin': origin, 'status': status,
                        'passed': status == 403 and 'access-control-allow-origin' not in normalized})
    status, final, headers, body = request(backend + '/api/analytics/report', headers={'Origin': 'https://alexjang14.github.io'})
    normalized = {key.lower(): value for key, value in headers.items()}
    results.append({'name': 'private reports remain protected', 'status': status,
                    'passed': status in [401, 403] and 'access-control-allow-origin' not in normalized})

report = {'target': args.target, 'base': base, 'browserInteractionTest': False, 'results': results,
          'passed': all(result['passed'] for result in results)}
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'base': base, 'checkedAssets': len(files), 'passed': sum(item['passed'] for item in results),
                  'total': len(results), 'failures': [item for item in results if not item['passed']], 'evidence': str(output)}))
raise SystemExit(0 if report['passed'] else 1)
