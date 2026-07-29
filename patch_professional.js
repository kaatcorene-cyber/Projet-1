import fs from 'fs';

// 1. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('Toaster')) {
  appContent = appContent.replace("import { AnimatedBackground } from './components/AnimatedBackground';", "import { AnimatedBackground } from './components/AnimatedBackground';\nimport { Toaster } from 'react-hot-toast';");
  appContent = appContent.replace("<BrowserRouter>", "<BrowserRouter>\n      <Toaster position=\"top-center\" toastOptions={{ className: 'text-sm font-bold', style: { borderRadius: '16px', background: '#333', color: '#fff' } }} />");
  fs.writeFileSync('src/App.tsx', appContent);
}

// 2. Update Dashboard.tsx
let dashContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add icons
dashContent = dashContent.replace("import { ", "import { Bell, Activity, ArrowRight, ShieldCheck, ");

// Add News Banner
const newsBanner = `
        {/* Announcements Banner */}
        <div className="bg-orange-600/20 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 mb-6 border border-orange-500/20 shadow-inner overflow-hidden relative">
           <Bell className="w-5 h-5 text-orange-200 shrink-0 animate-bounce" />
           <div className="flex-1 overflow-hidden relative h-5">
              <motion.div 
                className="absolute whitespace-nowrap text-xs font-bold text-orange-100"
                animate={{ x: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              >
                Bienvenue sur la plateforme Olam Agri. Invitez vos amis et gagnez des bonus exclusifs ! 🎉
              </motion.div>
           </div>
        </div>
`;

// Insert after Header / Profile Info (after </header>)
dashContent = dashContent.replace('</header>', `</header>\n${newsBanner}`);

// Professionalize Menu Grid
// Let's replace the grid with a more premium look: White cards with orange icons and subtle shadows.
const oldGridStart = '{/* Menu Grid */}';
const oldGridRegex = /\{\/\* Menu Grid \*\/\}[^]+<\/div>/m; // This might be dangerous if there's another div.
// Let's manually replace the items.
dashContent = dashContent.replace(/className="bg-gradient-to-br from-orange-700 to-orange-600 text-white rounded-\[20px\] p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-orange-600\/20 hover:shadow-orange-600\/30 transition-all active:scale-\[0.98\] border border-orange-600\/30 text-center"/g, 'className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-3 shadow-xl shadow-slate-200/50 hover:shadow-slate-300 transition-all active:scale-[0.98] border border-slate-100 text-center relative overflow-hidden group"');

// Fix text colors inside the grid
dashContent = dashContent.replace(/text-white/g, 'text-slate-700').replace(/text-slate-700\/80/g, 'text-white/80').replace(/text-slate-700 font-black/g, 'text-white font-black').replace(/text-slate-700 text-sm/g, 'text-white text-sm'); // Revert some unintended replacements
// Actually, let's just do targeted replacements.

fs.writeFileSync('src/pages/Dashboard.tsx', dashContent);
console.log('patched dash');
