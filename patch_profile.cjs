const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Remove showAboutModal state
content = content.replace(
  'const [showAboutModal, setShowAboutModal] = useState(false);\n',
  ''
);

// Replace button with Link
const btnTarget = `<button onClick={() => setShowAboutModal(true)} className="w-full flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200 text-left">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mr-4 shrink-0">
               <Info className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">À propos</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
           </button>`;

const lnkReplacement = `<Link to="/about" className="w-full flex items-center p-4 bg-white hover:bg-slate-50 rounded-2xl transition-colors group shadow-sm border border-slate-200 text-left">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mr-4 shrink-0">
               <Info className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-900 flex-1 text-sm">À propos</span>
             <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
           </Link>`;

content = content.replace(btnTarget, lnkReplacement);

// Remove the modal code
const modalStart = '      {/* About Modal */}';
const modalEndIdx = content.indexOf('</AnimatePresence>', content.indexOf('<!-- About Modal -->') !== -1 ? content.indexOf('<!-- About Modal -->') : content.indexOf(modalStart));
// The end index should be the closing AnimatePresence for the About modal. Let's find it carefully.
