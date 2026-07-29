import fs from 'fs';
const lines = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8').split('\n');
const fixed = lines.slice(0, 182).join('\n') + `
      <div className="absolute top-0 left-0 w-full h-[280px] bg-orange-600 rounded-b-[40px] shadow-md overflow-hidden pointer-events-none"></div>
      
      <div className="max-w-md mx-auto pt-6 px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
             <img src="/olam_logo_final.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover bg-white" />
             <h1 className="text-white text-xl font-black tracking-wide">Olam Agri</h1>
           </div>
        </div>
` + lines.slice(190).join('\n');
fs.writeFileSync('src/pages/Dashboard.tsx', fixed);
