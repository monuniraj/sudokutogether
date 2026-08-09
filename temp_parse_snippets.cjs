const fs = require('fs');
const ts = require('typescript');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const lines = text.split(/\r?\n/);
const ranges = [
  {name:'handleSaveGame', start:2656, end:2752},
  {name:'fetchLeaderboardResults', start:2771, end:2795},
  {name:'handleOpenRankings', start:2701, end:2758},
  {name:'registerChallengeJoin', start:2796, end:2835}
];
for (const r of ranges) {
  const snippet = lines.slice(r.start-1, r.end).join('\n');
  const src = 'function test() {\n' + snippet + '\n}';
  const sf = ts.createSourceFile('test.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const diags = sf.parseDiagnostics;
  console.log(r.name, 'lines', r.start, r.end, 'diagnostics', diags.length);
  diags.forEach(d => {
    console.log('  ', d.messageText, ts.getLineAndCharacterOfPosition(sf, d.start));
  });
}
