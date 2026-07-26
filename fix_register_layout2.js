import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

content = content.replace(/className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden bg-transparent py-10"/g, 'className="h-[100dvh] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent py-4"');

content = content.replace(/className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200"/g, 'className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200"');

content = content.replace(/className="space-y-4"/g, 'className="space-y-2.5"');

content = content.replace(/py-3\.5/g, 'py-2.5');

content = content.replace(/font-bold py-4 rounded-xl mt-6/g, 'font-bold py-3 rounded-xl mt-4');

content = content.replace(/text-sm mt-8 font-medium/g, 'text-sm mt-4 font-medium');

fs.writeFileSync('src/pages/Register.tsx', content);
