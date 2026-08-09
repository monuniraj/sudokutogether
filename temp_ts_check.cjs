const fs = require('fs');
const ts = require('typescript');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const lines = text.split(/\r?\n/);
const parseLines = (n) => {
  const src = lines.slice(0, n).join('\n');
  const sf = ts.createSourceFile('App.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return sf.parseDiagnostics;
};
let low = 1;
let high = lines.length;
let best = 0;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  const diags = parseLines(mid);
  if (diags.length === 0) {
    best = mid;
    low = mid + 1;
  } else {
    high = mid - 1;
  }
}
console.log('best parsed lines', best);
if (best < lines.length) {
  console.log('next line', best + 1, lines[best]);
  const diags = parseLines(best + 1);
  console.log('diags', diags.map(d => ({ message: d.messageText, pos: ts.getLineAndCharacterOfPosition(parseLines(best+1).sourceFile, d.start) })) );
}
