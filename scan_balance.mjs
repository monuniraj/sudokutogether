import fs from 'fs';
import ts from 'typescript';
import path from 'path';
const text = fs.readFileSync('src/App.tsx', 'utf8');
const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.JSX, text);
let token = scanner.scan();
const stack = [];
const mismatch = [];
const counts = { openBrace:0, closeBrace:0, openParen:0, closeParen:0, openBracket:0, closeBracket:0, lt:0, gt:0 };
const tokenNames = ts.SyntaxKind;
while (token !== ts.SyntaxKind.EndOfFileToken) {
  const pos = scanner.getTextPos();
  const loc = text.slice(0, pos).split('\n').length;
  if (token === ts.SyntaxKind.OpenBraceToken) { stack.push({token:'{', pos, line:loc}); counts.openBrace++; }
  if (token === ts.SyntaxKind.CloseBraceToken) {
    counts.closeBrace++;
    const top = stack[stack.length-1];
    if (top && top.token === '{') stack.pop(); else mismatch.push({expected:'{', found:'}', pos, line:loc});
  }
  if (token === ts.SyntaxKind.OpenParenToken) { stack.push({token:'(', pos, line:loc}); counts.openParen++; }
  if (token === ts.SyntaxKind.CloseParenToken) {
    counts.closeParen++;
    const top = stack[stack.length-1];
    if (top && top.token === '(') stack.pop(); else mismatch.push({expected:'(', found:')', pos, line:loc});
  }
  if (token === ts.SyntaxKind.OpenBracketToken) { stack.push({token:'[', pos, line:loc}); counts.openBracket++; }
  if (token === ts.SyntaxKind.CloseBracketToken) {
    counts.closeBracket++;
    const top = stack[stack.length-1];
    if (top && top.token === '[') stack.pop(); else mismatch.push({expected:'[', found:']', pos, line:loc});
  }
  token = scanner.scan();
}
console.log('counts', counts);
console.log('stack tail', stack.slice(-20));
console.log('mismatch tail', mismatch.slice(-20));
