import fs from 'fs';
import path from 'path';
import ts from 'typescript';
const fileName = path.join(process.cwd(), 'src', 'App.tsx');
const text = fs.readFileSync(fileName, 'utf8');
const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
console.log('parseDiagnostics', source.parseDiagnostics.length);
for (const d of source.parseDiagnostics) {
  const msg = typeof d.messageText === 'string' ? d.messageText : ts.flattenDiagnosticMessageText(d.messageText, '\n');
  const loc = source.getLineAndCharacterOfPosition(d.start || 0);
  console.log(d.code, msg, `${loc.line+1}:${loc.character+1}`);
}
