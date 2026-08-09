const fs = require('fs');
const ts = require('typescript');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const lines = text.split(/\r?\n/);
const test = (n) => {
  const src = lines.slice(0, n).join('\n');
  const sf = ts.createSourceFile('App.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return sf.parseDiagnostics;
};
const checkpoints = [40, 80, 120, 200, 400, 800, 1200, 1600, 2000, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4200, 4600, 5000, 5400, 5800, 6200, 6600, 7000, 7400, 7800, 8200, 8600, 8800, lines.length];
for (const n of checkpoints) {
  const diags = test(n);
  console.log(n, diags.length, diags.map(d => ({ message: d.messageText, line: ts.getLineAndCharacterOfPosition(ts.createSourceFile('App.tsx', lines.slice(0,n).join('\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), d.start) })).slice(0,3));
}
