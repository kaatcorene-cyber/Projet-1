import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Remove LogOut button from header
const headerRegex = /<div className="flex justify-between items-center mb-6">[\s\S]*?<div className="flex items-center gap-3">[\s\S]*?<\/div>\s*<button onClick=\{\(\) => \{ logout\(\); navigate\('\/login'\); \}\} className="w-10 h-10 bg-white\/20 hover:bg-white\/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">\s*<LogOut className="w-5 h-5 text-white" \/>\s*<\/button>\s*<\/div>/;

const newHeader = `<div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
             <img src="/olam_logo_final.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover bg-white" />
             <h1 className="text-white text-xl font-black tracking-wide">Olam Agri</h1>
           </div>
        </div>`;
dash = dash.replace(headerRegex, newHeader);

// 2. Remove menuItems declaration
dash = dash.replace(/const menuItems = \[\s*\{[^\]]*\}\s*\];/g, '');

// 3. Replace everything from {/* Menu List */} to the end of the lists with the unified list
const listsRegex = /\{\/\* Menu List \*\/\}[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$)/;

const newLists = `{/* Unified Menu List */}
        <div className="flex flex-col gap-2">
           <Link to="/products" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <FileSignature className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Contrats Actifs</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </Link>

           <Link to="/bank" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <PiggyBank className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Compte Retrait</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </Link>
           
           <a href={getTgLink(groupLink)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Users className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Groupe Officiel</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </a>

           <button onClick={() => installPWA()} className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50 text-left">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Download className="w-6 h-6 text-orange-600" />
               </div>
               <span className="font-bold text-slate-800 text-[15px]">Installer l'app</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-600 transition-colors" />
           </button>
           
           <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-[24px] transition-colors group shadow-sm border border-slate-100/50 text-left mt-2">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-[16px] bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <LogOut className="w-6 h-6 text-red-500" />
               </div>
               <span className="font-bold text-red-600 text-[15px]">Déconnexion</span>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-500 transition-colors" />
           </button>
        </div>`;

dash = dash.replace(listsRegex, newLists);

fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Fixed dashboard layout');
