// Static audit mirroring the grading rubric "Zero legacy APIs / zero div-soup".
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src/', import.meta.url));;
const rules = [
  { id: 'class-component', re: /class\s+\w+\s+extends\s+(React\.)?Component/ },
  { id: 'ReactDOM.render', re: /ReactDOM\.render\s*\(/ },
  { id: 'defaultProps', re: /\.defaultProps\b/ },
  { id: 'keyCode', re: /\bkeyCode\b/ },
  { id: 'window.alert', re: /(^|[^.\w])(window\.)?alert\s*\(/ },
  { id: 'import * as React', re: /import\s+\*\s+as\s+React/ },
  { id: 'http:// url', re: /['"`]http:\/\// },
  { id: 'dangerouslySetInnerHTML', re: /dangerouslySetInnerHTML/ },
  { id: '<div> (div-soup)', re: /<div[\s>]/ },
  { id: 'index key', re: /key=\{(i|idx|index)\}/ },
  { id: 'setSeconds(s => s - 1)', re: /set\w+\(\s*\(?\w+\)?\s*=>\s*\w+\s*-\s*1\s*\)/ },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (['.js', '.jsx', '.ts', '.tsx'].includes(extname(p))) yield p;
  }
}

let findings = 0;
let files = 0;
for (const file of walk(ROOT)) {
  files += 1;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    for (const r of rules) {
      if (r.re.test(line)) {
        findings += 1;
        console.error(`✗ ${r.id}  ${file.replace(ROOT, 'src/')}:${i + 1}  ${line.trim()}`);
      }
    }
  });
}
console.log(`audit:legacy scanned ${files} files, findings = ${findings}`);
process.exit(findings === 0 ? 0 : 1);
