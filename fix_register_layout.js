import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

// Replace min-h-screen and py-10
content = content.replace('className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden bg-transparent py-10"', 'className="h-[100dvh] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent"');

// Replace image banner h-32 mb-6 to h-24 mb-4
content = content.replace('className="w-full h-32 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200"', 'className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200"');

// Replace space-y-4 with space-y-3
content = content.replace('className="space-y-4"', 'className="space-y-3"');

// Replace py-3.5 with py-2.5 on all inputs
content = content.replace(/py-3\.5/g, 'py-2.5');

// Replace py-4 with py-3 on button
content = content.replace('font-bold py-4 rounded-xl mt-6', 'font-bold py-3 rounded-xl mt-4');

// Replace mt-8 with mt-4
content = content.replace('text-sm mt-8 font-medium', 'text-sm mt-4 font-medium');

fs.writeFileSync('src/pages/Register.tsx', content);
