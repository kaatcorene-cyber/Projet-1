import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

// Reduce image height
content = content.replace(/className="h-40 w-full relative"/g, 'className="h-28 w-full relative"');

// Reduce title size
content = content.replace(/className="text-2xl font-black text-white leading-none drop-shadow-md"/g, 'className="text-xl font-black text-white leading-none drop-shadow-md"');

// Reduce button padding
content = content.replace(/py-4 rounded-2xl text-sm font-black transition-all/g, 'py-3.5 rounded-xl text-sm font-black transition-all');

// Reduce gap in the lower section
content = content.replace(/p-4 flex flex-col gap-4/g, 'p-3.5 flex flex-col gap-3');

fs.writeFileSync('src/pages/Revenues.tsx', content);
