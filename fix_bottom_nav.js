import fs from 'fs';
let code = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

// Change outer background gradient
code = code.replace(/bg-gradient-to-t from-slate-50 via-slate-50\/80 to-transparent/g, 'bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent');

// Change pill background and border
code = code.replace(/bg-white\/90 backdrop-blur-2xl border border-slate-200\/50 p-2 rounded-3xl shadow-2xl shadow-emerald-500\/5/g, 'bg-slate-800/90 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl shadow-2xl shadow-black/50');

// Change Active text color
code = code.replace(/isActive \? "text-emerald-500" : "text-slate-500 hover:text-slate-700"/g, 'isActive ? "text-yellow-400" : "text-slate-500 hover:text-slate-300"');

// Change Active pill background
code = code.replace(/bg-emerald-500\/10 rounded-2xl border border-emerald-500\/20/g, 'bg-yellow-500/10 rounded-2xl border border-yellow-500/20');

// Change icon drop shadow
code = code.replace(/drop-shadow-\[0_0_8px_rgba\(16,185,129,0\.3\)\]/g, 'drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]');

fs.writeFileSync('src/components/BottomNav.tsx', code);
