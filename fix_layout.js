import fs from 'fs';
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Change background color of the Layout root div
code = code.replace(/<div className="min-h-screen text-slate-900 pb-20 font-sans bg-slate-50">/g, '<div className="min-h-screen text-slate-200 pb-20 font-sans bg-slate-900">');

// Modify the Top Mini Header Admin button to match dark/yellow theme
code = code.replace(/bg-white\/80 backdrop-blur-md border-emerald-500\/50 shadow-emerald-500\/20 border rounded-full flex items-center justify-center text-emerald-400 shadow-sm hover:bg-slate-700/g, 'bg-slate-800/80 backdrop-blur-md border-yellow-500/50 shadow-yellow-500/20 border rounded-full flex items-center justify-center text-yellow-400 shadow-sm hover:bg-slate-700');

fs.writeFileSync('src/components/Layout.tsx', code);
