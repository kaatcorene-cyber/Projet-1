import fs from 'fs';

// --- REGISTER.TSX ---
let regContent = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regTopHtml = `
    <div className="h-[100dvh] relative flex flex-col overflow-hidden bg-slate-50">
      <div className="w-full h-48 sm:h-56 shrink-0 relative">
        <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069&auto=format&fit=crop" alt="OlamAgri Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50"></div>
      </div>
      <div className="flex-1 relative z-10 w-full max-w-sm mx-auto flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
`;

regContent = regContent.replace(
  /<div className="h-\[100dvh\] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent py-4">\s*<div className="relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center">\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="w-full"\s*>\s*<div className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200">\s*<img src="https:\/\/i\.imgur\.com\/K9gVSeO\.(jpeg|jpg)" alt="OlamAgri Banner" className="w-full h-full object-cover" \/>\s*<\/div>/,
  regTopHtml
);

fs.writeFileSync('src/pages/Register.tsx', regContent);

// --- LOGIN.TSX ---
let logContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const logTopHtml = `
    <div className="h-[100dvh] relative flex flex-col overflow-hidden bg-slate-50">
      <div className="w-full h-48 sm:h-56 shrink-0 relative">
        <img src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069&auto=format&fit=crop" alt="OlamAgri Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50"></div>
      </div>
      <div className="flex-1 relative z-10 w-full max-w-sm mx-auto flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
`;

logContent = logContent.replace(
  /<div className="h-\[100dvh\] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent">\s*<div className="relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center">\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="w-full"\s*>\s*<div className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200">\s*<img src="https:\/\/i\.imgur\.com\/4vcZalt\.jpg" alt="OlamAgri Banner" className="w-full h-full object-cover" \/>\s*<\/div>/,
  logTopHtml
);

fs.writeFileSync('src/pages/Login.tsx', logContent);

