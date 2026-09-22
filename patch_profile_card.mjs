import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const targetContent = `{/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-2xl border border-brand-400/20">
          {/* Internal deco */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            {/* User Info Line */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Phone className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-white font-medium tracking-widest text-sm">{user?.phone}</span>
              </div>
              <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                {hasRecharged ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {hasRecharged ? 'Actif' : 'Nouveau'}
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-8">
              <p className="text-brand-100/80 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> Solde Total
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-xl sm:text-2xl font-bold text-brand-200">FCFA</span>
              </h2>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/deposit" 
                className="bg-white text-brand-700 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 shadow-lg"
              >
                <ArrowDownLeft className="w-5 h-5" /> Recharger
              </Link>
              <Link 
                to="/withdraw" 
                className="bg-black/20 text-white border border-white/20 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 hover:bg-black/30 backdrop-blur-sm"
              >
                <ArrowUpRight className="w-5 h-5" /> Retirer
              </Link>
            </div>
          </div>
        </div>`;

const newContent = `{/* Main Premium Card */}
        <div className="mb-10">
          <div className="bg-gradient-to-br from-[#0c4096] to-[#011438] rounded-[32px] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/30 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/30 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Top row: Phone & Status */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <span className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-1.5">Mon Compte</span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-mono font-medium text-sm tracking-widest">{user?.phone}</span>
                  </div>
                </div>

                <div className={\`px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md border \${hasRecharged ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}\`}>
                  {hasRecharged ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  <span className={\`text-[10px] font-bold uppercase tracking-widest \${hasRecharged ? 'text-emerald-400' : 'text-amber-400'}\`}>
                    {hasRecharged ? 'Vérifié' : 'Nouveau'}
                  </span>
                </div>
              </div>

              {/* Middle row: Balance */}
              <div className="mt-2 mb-2">
                <p className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Solde Disponible
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {new Intl.NumberFormat('fr-FR').format(balance)}
                  </h2>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Hovering Below */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Link 
              to="/deposit" 
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <ArrowDownLeft className="w-5 h-5" /> RECHARGER
            </Link>
            <Link 
              to="/withdraw" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm transition-transform active:scale-95 backdrop-blur-md"
            >
              <ArrowUpRight className="w-5 h-5" /> RETIRER
            </Link>
          </div>
        </div>`;

content = content.replace(targetContent, newContent);
fs.writeFileSync('src/pages/Profile.tsx', content);
