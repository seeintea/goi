import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ignoreDirs = new Set(['.git', 'node_modules']);

function deleteDist(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        
        if (ignoreDirs.has(entry.name)) {
          continue;
        }

        if (entry.name === 'dist') {
          console.log(`Deleting: ${fullPath}`);
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          deleteDist(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${dir}:`, error.message);
  }
}

console.log('Starting to clean "dist" directories...');
console.log(`Root directory: ${rootDir}`);
deleteDist(rootDir);
console.log('Clean dist completed.');
