import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = 'public/assets/js';
const FORBIDDEN = [
  { name: 'eval()', pattern: /\beval\s*\(/u },
  { name: 'Function constructor', pattern: /\bnew\s+Function\s*\(/u },
  { name: 'dynamic HTML insertion', pattern: /\binnerHTML\s*=/u },
  { name: 'document.write', pattern: /\bdocument\.write\s*\(/u },
  { name: 'storage persistence', pattern: /\b(?:localStorage|sessionStorage)\b/u },
  { name: 'debug logging', pattern: /\bconsole\.(?:log|debug|info|warn|error)\s*\(/u },
];
const SUSPICIOUS_SECRET =
  /(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{25,}|sk-[A-Za-z0-9_-]{24,})/u;

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

let issues = 0;
for (const file of listFiles(SOURCE).filter((name) => name.endsWith('.js'))) {
  const code = readFileSync(file, 'utf8');
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(code)) {
      console.error(`FAIL: ${rule.name} in ${file}`);
      issues++;
    }
  }
  if (SUSPICIOUS_SECRET.test(code)) {
    console.error(`FAIL: possible secret in ${file}`);
    issues++;
  }
}

if (issues) process.exitCode = 1;
else
  console.info('PASS: local unsafe-API and obvious-secret checks (not a full SAST/secret scan).');
