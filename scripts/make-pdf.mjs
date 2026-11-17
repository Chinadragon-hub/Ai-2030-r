import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createScriptPdfDocument } from '../src/pdf/pdfGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputPath = path.join(publicDir, 'AI-2030-script.pdf');

fs.mkdirSync(publicDir, { recursive: true });

const doc = createScriptPdfDocument();
const arrayBuffer = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));

console.log(`Generated ${outputPath}`);
