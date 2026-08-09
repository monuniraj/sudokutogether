import fs from 'fs';
import path from 'path';
import ts from 'typescript';
const projectRoot = process.cwd();
const fileName = path.join(projectRoot, 'src', 'App.tsx');
const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
let compilerOptions = { jsx: ts.JsxEmit.Preserve, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, moduleResolution: ts.ModuleResolutionKind.NodeNext };
if (configPath) {
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    console.error('Config read error', configFile.error);
    process.exit(1);
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  compilerOptions = parsed.options;
}
const program = ts.createProgram([fileName], compilerOptions);
const diagnostics = ts.getPreEmitDiagnostics(program);
console.log('diagnostics', diagnostics.length);
for (const d of diagnostics) {
  const msg = typeof d.messageText === 'string' ? d.messageText : ts.flattenDiagnosticMessageText(d.messageText, '\n');
  const pos = d.start != null && d.file ? d.file.getLineAndCharacterOfPosition(d.start) : null;
  console.log(d.code, msg, pos ? `${pos.line+1}:${pos.character+1}` : 'no-pos');
}
