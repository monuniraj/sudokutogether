import fs from 'fs';
import path from 'path';
import ts from 'typescript';
const fileName = path.join(process.cwd(), 'src', 'App.tsx');
const text = fs.readFileSync(fileName, 'utf8');
const lines = text.split(/\r?\n/);
function checkLineCount(n) {
  const prefix = lines.slice(0, n).join('\n');
  const source = ts.createSourceFile(fileName, prefix, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const diagnostics = ts.getPreEmitDiagnostics(source).filter(d => d.category === ts.DiagnosticCategory.Error);
  return diagnostics.length === 0;
}
let low = 1;
let high = lines.length;
let good = 0;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (checkLineCount(mid)) {
    good = mid;
    low = mid + 1;
  } else {
    high = mid - 1;
  }
}
console.log('good prefix lines:', good, '/', lines.length);
console.log('next line:', good + 1);
console.log('line content:', lines[good] ? `${good+1}: ${lines[good]}` : '<none>');
if (good < lines.length) {
  for (let i = Math.max(0, good-20); i < Math.min(lines.length, good+20); i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
