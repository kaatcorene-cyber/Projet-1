const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const targetContent = `           <Link to="/team" className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mr-4 shrink-0">
               <Users className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Mon Équipe</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
           </Link>

           <Link to="/commissions" className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mr-4 shrink-0">
               <Gift className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Commissions</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
           </Link>
           
           <button
             onClick={() => {
               if (isIOS) {
                 setShowIOSOverlay(true);
               } else {
                 installPWA();
               }
             }}
             className="w-full flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200 text-left"
           >
             <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 mr-4 shrink-0">
               <Download className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Installer l'app</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
           </button>`;

const replacementContent = `           <a href="https://t.me/+w9yTyaXn7AxjMzc0" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200">
             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mr-4 shrink-0">
               <Users className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">Groupe officiel</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
           </a>`;

// Just to handle potential formatting mismatches:
const regex = /<Link to="\/team"[\s\S]*?<button\s+onClick=\{\(\) => \{\s+if \(isIOS\) \{\s+setShowIOSOverlay\(true\);\s+\} else \{\s+installPWA\(\);\s+\}\s+\}\}[\s\S]*?Installer l'app<\/span>[\s\S]*?<\/button>/;

content = content.replace(regex, replacementContent);
fs.writeFileSync('src/pages/Profile.tsx', content);
