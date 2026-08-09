const fs = require('fs');
const ts = require('typescript');
const text = fs.readFileSync('src/App.tsx', 'utf8');
const lines = text.split(/\r?\n/);
const ranges = [
  { name: 'handleSaveGame', start: 2656, end: 2752 },
  { name: 'handleOpenRankings', start: 2701, end: 2758 },
  { name: 'fetchLeaderboardResults', start: 2771, end: 2795 },
];
for (const r of ranges) {
  const snippet = lines.slice(r.start - 1, r.end).join('\n');
  const sf = ts.createSourceFile('snippet.tsx', snippet, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  console.log('===', r.name, '===');
  console.log('lines', r.start, r.end, 'len', r.end-r.start+1);
  console.log('diagnostics', sf.parseDiagnostics.length);
  sf.parseDiagnostics.forEach(d => {
    console.log('  msg', d.messageText, 'line', ts.getLineAndCharacterOfPosition(sf, d.start));
  });
}
