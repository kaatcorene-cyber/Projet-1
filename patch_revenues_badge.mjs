import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const oldImageHeader = `<div className="absolute inset-0 bg-gradient-to-t from-[#03296c] via-[#03296c]/40 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">`;

const newImageHeader = `<div className="absolute inset-0 bg-gradient-to-t from-[#03296c] via-[#03296c]/40 to-transparent"></div>
                <div className="absolute top-3 left-4">
                   <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-1.5 shadow-sm">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                     <span className="text-white font-bold text-[10px] uppercase tracking-wider">Disponible</span>
                   </div>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">`;

content = content.replace(oldImageHeader, newImageHeader);
fs.writeFileSync('src/pages/Revenues.tsx', content);
