import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

// Reduce image height even more
content = content.replace(/className="h-28 w-full relative"/g, 'className="h-20 w-full relative"');

// Reduce title size even more
content = content.replace(/className="text-xl font-black text-white leading-none drop-shadow-md"/g, 'className="text-lg font-black text-white leading-none drop-shadow-md"');

// Reduce button padding
content = content.replace(/py-3.5 rounded-xl text-sm font-black transition-all/g, 'py-2.5 rounded-xl text-xs font-black transition-all');

// Reduce card padding
content = content.replace(/className="bg-white\/5 rounded-3xl overflow-hidden border border-white\/10 flex flex-col shadow-lg"/g, 'className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex flex-col shadow-lg"');
content = content.replace(/p-3.5 flex flex-col gap-3/g, 'p-2.5 flex flex-col gap-2.5');
content = content.replace(/p-3 rounded-2xl border/g, 'p-2 rounded-xl border');

// Reduce texts
content = content.replace(/text-brand-400 font-black text-sm/g, 'text-brand-400 font-black text-xs');
content = content.replace(/text-white font-black text-sm/g, 'text-white font-black text-xs');


fs.writeFileSync('src/pages/Revenues.tsx', content);
