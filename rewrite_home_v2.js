import fs from 'fs';

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const returnStart = code.lastIndexOf('  return (\n    <div className="px-4');

if (returnStart === -1) {
    console.log("Could not find the start of the return statement");
    process.exit(1);
}

const beforeReturn = code.substring(0, returnStart);

const replacement = `  return (
    <div className="px-4 pt-4 pb-32 min-h-[100dvh] bg-slate-900 font-sans relative overflow-hidden text-slate-200">
      
      {/* Modale de Bienvenue */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-800 border border-white/10 rounded-3xl overflow-hidden max-w-sm w-full flex flex-col shadow-2xl relative"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-6 flex items-center justify-center shadow-xl shadow-yellow-500/20 rotate-3">
                   <Leaf className="w-8 h-8 text-slate-900 -rotate-3" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Bienvenue sur ElevFinAi</h2>
                <p className="text-slate-400 text-[15px] font-medium mb-8 leading-relaxed">
                  Votre plateforme dédiée à l'investissement dans le secteur de l'élevage. Découvrez nos opportunités et générez des revenus passifs.
                </p>
                <div className="w-full flex flex-col gap-3">
                  <a 
                    href={config?.group_link || "https://t.me/+6Po4wpvKD-QzYWVk"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-[#0088cc] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 active:scale-95 transition-transform"
                  >
                    Rejoindre Telegram
                  </a>
                  <button 
                    onClick={closeJoinModal}
                    className="w-full py-4 bg-slate-900/50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-900 hover:text-slate-300 active:scale-95 transition-colors border border-white/5"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Carousel */}
      <div className="relative w-[calc(100%+2rem)] -ml-4 -mt-4 mb-8 aspect-[4/3] rounded-b-[2rem] overflow-hidden bg-slate-950 shadow-2xl shadow-black/50 border-b border-white/5">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={BANNER_IMAGES[currentSlide]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Banner Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12">
           <h2 className="text-3xl font-black text-white mb-2 leading-tight">Générez des<br/><span className="text-yellow-400">Revenus Passifs</span></h2>
           <p className="text-slate-300 text-sm font-medium">Investissez dans l'élevage en Côte d'Ivoire.</p>
        </div>

        <div className="absolute bottom-5 left-6 right-6 flex justify-start items-center">
           <div className="flex gap-2">
             {BANNER_IMAGES.map((_, i) => (
               <div key={i} className={\`h-1.5 rounded-full transition-all duration-300 \${i === currentSlide ? 'w-6 bg-yellow-500' : 'w-2 bg-white/30'}\`} />
             ))}
           </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link, i) => (
          <Link key={i} to={link.path} className="flex flex-col items-center gap-2 group">
            <div className={\`w-14 h-14 rounded-2xl \${link.color.replace('bg-', 'bg-slate-800 border border-white/5 text-')} flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform overflow-hidden\`}>
              {link.image ? (
                <img src={link.image} alt={link.label} className="w-full h-full object-cover opacity-90" />
              ) : (
                <link.icon className={\`w-6 h-6 \${link.color.includes('emerald') ? 'text-emerald-400' : link.color.includes('blue') ? 'text-blue-400' : link.color.includes('amber') ? 'text-amber-400' : link.color.includes('purple') ? 'text-purple-400' : 'text-yellow-400'}\`} />
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-400">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Install App Banner */}
      <button onClick={() => { if (isIOS) setShowIOSOverlay(true); else installPWA(); }} className="w-full flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-800/50 border border-white/10 rounded-3xl p-4 mb-8 shadow-lg shadow-black/20 active:scale-95 transition-transform text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Application Mobile</h3>
            <p className="text-xs text-slate-400 font-medium">Téléchargez ElevFinAi</p>
          </div>
        </div>
        <div className="bg-yellow-500 text-slate-900 text-xs font-black px-4 py-2.5 rounded-full shadow-sm">
          Installer
        </div>
      </button>

      {/* Packs Header */}
      <div className="mb-6 flex items-center justify-between">
         <div>
             <h1 className="text-2xl font-black text-white tracking-tight">Packs Disponibles</h1>
             <p className="text-yellow-500/80 text-xs font-bold mt-1 uppercase tracking-wider">Commencez à générer des revenus</p>
         </div>
      </div>

      {/* Messages */}
      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={\`p-4 rounded-xl mb-6 flex items-center gap-3 border \${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}\`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </motion.div>
      )}

      {/* Plans List */}
      <div className="space-y-4 max-w-[340px] mx-auto">
        {isLoadingPlans ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
        ) : activePlans.length === 0 ? (
          <div className="text-center py-12"><p className="text-slate-500 font-medium">Aucun pack disponible.</p></div>
        ) : (
          activePlans.map((plan, idx) => {
            const hasInsufficientBalance = (user?.balance || 0) < plan.amount;
            return (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-slate-800 rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-5 relative overflow-hidden">
              
              {/* Highlight gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex gap-4 items-center relative z-10">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner border border-white/10">
                   <img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-90" />
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start gap-2">
                     <div>
                       <span className="text-yellow-500/80 text-[10px] font-bold uppercase tracking-wider mb-1 block">{getPlanName(plan.amount)}</span>
                       <h3 className="text-xl font-black text-white leading-tight">{formatCurrency(plan.amount)}</h3>
                     </div>
                     <div className="bg-slate-900/80 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                       <Clock className="w-3.5 h-3.5 text-slate-400" />
                       <span className="text-slate-300 font-bold text-xs">{plan.duration || 30} Jrs</span>
                     </div>
                   </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 relative z-10">
                 <div className="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase mb-1">Gain par jour</span>
                    <span className="text-yellow-400 font-black text-sm">{formatCurrency(plan.daily)}</span>
                 </div>
                 <div className="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-[10px] font-bold uppercase mb-1">Gain total</span>
                    <span className="text-white font-black text-sm">{formatCurrency(plan.total)}</span>
                 </div>
              </div>
              
              <button
                onClick={() => {
                  if (hasInsufficientBalance) {
                    setMessage({ type: 'error', text: 'Votre solde est insuffisant pour payer ce pack.' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => setMessage(null), 3000);
                  } else {
                    handleInvest(plan, idx);
                  }
                }}
                disabled={loading === idx}
                className={\`w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 relative z-10 \${hasInsufficientBalance ? 'bg-slate-900/80 text-slate-500 border border-white/5 active:scale-95' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 hover:from-yellow-400 hover:to-yellow-500 active:scale-95 shadow-lg shadow-yellow-500/20'}\`}
              >
                {loading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acheter ce pack'}
              </button>
            </motion.div>
          )})
        )}
      </div>

      {/* Full Screen iOS Install Overlay */}
      <AnimatePresence>
        {showIOSOverlay && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col p-6"
          >
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => setShowIOSOverlay(false)}
                className="w-10 h-10 bg-slate-800 rounded-full shadow-sm border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-yellow-400 mb-6 shadow-sm border border-white/10 self-center">
                <Apple className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-white tracking-tight text-center mb-2">Installation sur iOS</h2>
              <p className="text-slate-400 text-center mb-10 text-sm">Installez l'application sur votre iPhone pour une expérience plus rapide et en plein écran.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="text-white font-bold mb-1">Appuyez sur Partager</p>
                    <p className="text-slate-400 text-sm">Appuyez sur l'icône <Share className="w-4 h-4 inline-block mx-1 text-slate-300" /> dans la barre de navigation Safari en bas de votre écran.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="text-white font-bold mb-1">Ajouter à l'écran d'accueil</p>
                    <p className="text-slate-400 text-sm">Faites défiler le menu et sélectionnez l'option <strong className="text-slate-200">"Sur l'écran d'accueil"</strong> <PlusSquare className="w-4 h-4 inline-block mx-1 text-slate-300" />.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="text-white font-bold mb-1">Confirmer l'ajout</p>
                    <p className="text-slate-400 text-sm">Appuyez sur <strong className="text-slate-200">Ajouter</strong> en haut à droite de votre écran.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
`;

fs.writeFileSync('src/pages/Home.tsx', beforeReturn + replacement);
