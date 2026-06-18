import fs from 'fs';
import path from 'path';

const files = ['src/pages/Register.tsx', 'src/pages/Login.tsx'];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/className="w-full [^"]*focus:outline-none[^"]*"/g, 'className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium placeholder:text-zinc-500 tracking-wide"');
  fs.writeFileSync(f, content);
}
console.log("Fixed inputs.");
