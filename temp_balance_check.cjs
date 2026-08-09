const fs = require('fs');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const lines = text.split(/\r?\n/);
const start = 2520 - 1;
const end = 2965;
let inStr = null;
let escape = false;
let inComment = null;
let brace = 0, paren = 0, bracket = 0;
for (let li = start; li < end; li++) {
  const line = lines[li];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const nxt = i + 1 < line.length ? line[i + 1] : '';
    if (inComment) {
      if (inComment === '//') break;
      if (inComment === '/*' && ch === '*' && nxt === '/') { inComment = null; i++; continue; }
      continue;
    }
    if (inStr) {
      if (escape) { escape = false; }
      else if (ch === '\\') { escape = true; }
      else if (ch === inStr) { inStr = null; }
      continue;
    }
    if (ch === '/' && nxt === '/') { inComment = '//'; i++; continue; }
    if (ch === '/' && nxt === '*') { inComment = '/*'; i++; continue; }
    if (ch === '`' || ch === '"' || ch === "'") { inStr = ch; continue; }
    if (ch === '(') { paren++; }
    else if (ch === ')') { paren--; }
    else if (ch === '[') { bracket++; }
    else if (ch === ']') { bracket--; }
    else if (ch === '{') { brace++; }
    else if (ch === '}') { brace--; }
  }
}
console.log('brace', brace, 'paren', paren, 'bracket', bracket); console.log('inStr', inStr, 'inComment', inComment);