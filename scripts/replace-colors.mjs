import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const FROM = ['#1e40af', '#1d4ed8', '#93c5fd', 'rgba(30,64,175', 'rgba(30, 64, 175'];
const TO   = ['#7c3aed', '#6d28d9', '#c4b5fd', 'rgba(124,58,237', 'rgba(124, 58, 237'];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    const ext = extname(f);
    if (!['.css', '.tsx', '.ts'].includes(ext)) continue;
    let content = readFileSync(full, 'utf8');
    let changed = false;
    for (let i = 0; i < FROM.length; i++) {
      if (content.includes(FROM[i])) { content = content.split(FROM[i]).join(TO[i]); changed = true; }
    }
    if (changed) { writeFileSync(full, content, 'utf8'); console.log('Updated:', full); }
  }
}

walk('src');
console.log('Done!');
