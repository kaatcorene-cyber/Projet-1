import fs from 'fs';

let content = fs.readFileSync('src/pages/Setup.tsx', 'utf8');

content = content.replace(/text-slate-400/g, 'text-gray-500');
content = content.replace(/text-slate-50/g, 'text-gray-900');
content = content.replace(/text-slate-300/g, 'text-gray-600');
content = content.replace(/bg-slate-700/g, 'bg-gray-200');
content = content.replace(/border-slate-800/g, 'border-gray-200');

fs.writeFileSync('src/pages/Setup.tsx', content);

let contentAuth = fs.readFileSync('src/pages/Login.tsx', 'utf8');
contentAuth = contentAuth.replace(/bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-white/g, 'bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900');
contentAuth = contentAuth.replace(/bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-white/g, 'bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-gray-900');
fs.writeFileSync('src/pages/Login.tsx', contentAuth);

let contentReg = fs.readFileSync('src/pages/Register.tsx', 'utf8');
contentReg = contentReg.replace(/bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-white/g, 'bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900');
contentReg = contentReg.replace(/bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-white/g, 'bg-white border border-gray-200 shadow-sm rounded-xl pl-16 pr-4 py-3 text-gray-900');
contentReg = contentReg.replace(/bg-white\/10 border border-white\/20 rounded-xl px-4 py-3 text-white/g, 'bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900');
contentReg = contentReg.replace(/bg-white\/10 border border-white\/20 rounded-xl pl-16 pr-4 py-3 text-white/g, 'bg-white border border-gray-200 rounded-xl pl-16 pr-4 py-3 text-gray-900');
contentReg = contentReg.replace(/bg-white\/10 backdrop-blur-2xl border border-white\/20/g, 'bg-white border border-gray-100 shadow-sm');
contentReg = contentReg.replace(/bg-red-500\/20 border border-red-500\/50 rounded-xl text-red-100/g, 'bg-red-50 border border-red-100 rounded-xl text-red-600');
fs.writeFileSync('src/pages/Register.tsx', contentReg);

