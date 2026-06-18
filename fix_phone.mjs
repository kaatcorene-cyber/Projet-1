import fs from 'fs';
import path from 'path';

let f = 'src/pages/Register.tsx';
let content = fs.readFileSync(f, 'utf-8');
content = content.replace(/className="flex bg-zinc-900[^"]*"/, 'className="flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50 transition-all w-full"');
fs.writeFileSync(f, content);

console.log("Fixed phone field");
