import fs from 'fs';
import ts from 'typescript';
const text = fs.readFileSync('src/App.tsx', 'utf8');
const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.JSX, text);
let token = scanner.scan();
const stack = [];
const results = [];
let lineMap = text.split(/\r?\n/);
while (token !== ts.SyntaxKind.EndOfFileToken) {
  const start = scanner.getTextPos();
  const line = text.slice(0, start).split(/\r?\n/).length;
  if (token === ts.SyntaxKind.OpenBraceToken) {
    stack.push({pos: start, line});
  } else if (token === ts.SyntaxKind.CloseBraceToken) {
    if (stack.length === 0) {
      results.push({type:'unmatched-close', line});
    } else {
      stack.pop();
    }
  }
  token = scanner.scan();
}
console.log('unmatchedOpen', stack.length);
console.log(stack.slice(-10).map(x=>x.line));
console.log('unmatchedClose', results.slice(-10));
