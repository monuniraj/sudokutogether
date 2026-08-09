const fs = require('fs');
const src = fs.readFileSync('src/App.tsx', 'utf8');
const lines = src.split(/\r?\n/);
let inStr = null;
let inComment = null;
let brace = 0, paren = 0, bracket = 0;
const stack = [];
for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const nxt = line[i + 1] || '';
    if (inComment) {
      if (inComment === '//') break;
      if (inComment === '/*' && ch === '*' && nxt === '/') { inComment = null; i++; continue; }
      continue;
    }
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) { inStr = null; }
      continue;
    }
    if (ch === '/' && nxt === '/') { inComment = '//'; i++; continue; }
    if (ch === '/' && nxt === '*') { inComment = '/*'; i++; continue; }
    if (ch === '`') { inStr = '`'; continue; }
    if (ch === '"' || ch === "'") { inStr = ch; continue; }
    if (ch === '(') { paren++; stack.push({ch:'(', li, i}); }
    else if (ch === ')') { if (paren === 0) { console.log('unmatched ) at', li+1, i+1); process.exit(0);} paren--; stack.pop(); }
    else if (ch === '[') { bracket++; stack.push({ch:'[', li, i}); }
    else if (ch === ']') { if (bracket === 0) { console.log('unmatched ] at', li+1, i+1); process.exit(0);} bracket--; stack.pop(); }
    else if (ch === '{') { brace++; stack.push({ch:'{', li, i}); }
    else if (ch === '}') { if (brace === 0) { console.log('unmatched } at', li+1, i+1); process.exit(0);} brace--; stack.pop(); }
  }
}
console.log('counts', {brace, paren, bracket});
if (stack.length) console.log('top open', stack.slice(-20).map(x => x.ch + '@' + (x.li+1) + ':' + (x.i+1)));
