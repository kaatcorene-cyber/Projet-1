import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Replace min-h-screen and py-8
content = content.replace(/className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden bg-transparent"/g, 'className="h-[100dvh] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent"');
content = content.replace(/className="relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center min-h-screen py-8"/g, 'className="relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center"');

// Replace space-y-4 with space-y-2.5
content = content.replace(/className="space-y-4"/g, 'className="space-y-2.5"');
// Replace h-32 with h-24
content = content.replace(/className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200"/g, 'className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200"');
// Replace py-3.5 with py-2.5
content = content.replace(/py-3\.5/g, 'py-2.5');
// Replace py-4 with py-3
content = content.replace(/font-bold py-4 rounded-xl mt-6/g, 'font-bold py-3 rounded-xl mt-4');
// Replace mt-8 with mt-4
content = content.replace(/mt-8/g, 'mt-4');

fs.writeFileSync('src/pages/Login.tsx', content);
