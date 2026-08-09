const fs = require('fs');
const src = fs.readFileSync('src/App.tsx', 'utf8');
const returnStart = src.indexOf('  return (');
const returnEnd = src.length;
const returnCode = src.substring(returnStart, returnEnd);

let depth = 0;
let inStr = null;
let escape = false;
let inComment = null;
const stack = [];
let li = 0;
let charIndex = 0;

for (let i = 0; i < returnCode.length; i++) {
  const ch = returnCode[i];
  const nxt = returnCode[i + 1] || '';
  
  if (ch === '\n') { li++; charIndex = 0; } else { charIndex++; }
  
  if (inComment) {
    if (inComment === '//' && ch === '\n') { inComment = null; }
    if (inComment === '/*' && ch === '*' && nxt === '/') { inComment = null; i++; }
    continue;
  }
  if (inStr) {
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === inStr) { inStr = null; }
    continue;
  }
  if (ch === '/' && nxt === '/') { inComment = '//'; i++; continue; }
  if (ch === '/' && nxt === '*') { inComment = '/*'; i++; continue; }
  if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
  
  if (ch === '<' && nxt !== '/' && nxt !== '!' && nxt !== '>' && /[A-Za-z{]/.test(nxt)) {
    const tagMatch = returnCode.substring(i).match(/^<([A-Za-z_][A-Za-z0-9._-]*|\{[^}]*\})[^>]*?(\/>|>)/);
    if (tagMatch) {
      const tagName = tagMatch[1];
      const isSelfClose = tagMatch[2] === '/>';
      if (!isSelfClose) {
        stack.push({ tag: tagName, line: li, col: charIndex });
      }
      i += tagMatch[0].length - 1;
      continue;
    }
  }
  
  if (ch === '<' && nxt === '/') {
    const closeMatch = returnCode.substring(i).match(/^<\/([A-Za-z_][A-Za-z0-9._-]*|\{[^}]*\})[^>]*>/);
    if (closeMatch) {
      const tagName = closeMatch[1];
      if (stack.length > 0 && stack[stack.length - 1].tag === tagName) {
        stack.pop();
      } else {
        console.log('UNMATCHED CLOSE', tagName, 'line', li + 1);
      }
      i += closeMatch[0].length - 1;
      continue;
    }
  }
}

console.log('=== UNCLOSED TAGS (Stack) ===');
if (stack.length === 0) {
  console.log('✓ All tags closed!');
} else {
  console.log('UNCLOSED:', stack.length);
  stack.forEach((item, idx) => {
    console.log(`  ${idx + 1}. <${item.tag}> at line ${item.line + 1}`);
  });
}
