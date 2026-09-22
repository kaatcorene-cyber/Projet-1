import fs from 'fs';

let text = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

text = text.replace(
  /<motion\.div \n          initial=\{\{ opacity: 0, y: 10 \}\}\n          animate=\{\{ opacity: 1, y: 0 \}\}\n          className="bg-white rounded-\[32px\] p-8 shadow-lg shadow-slate-200\/50 border border-slate-100"\n        >\n          \{error && \([\s\S]*?\}\s*\)\}\n          <form onSubmit=\{handleSubmit\} className="space-y-6 relative z-10">\n            <motion\.div\n              initial=\{\{ opacity: 0, y: 10 \}\}\n             animate=\{\{ opacity: 1, y: 0 \}\}\n             className="bg-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-orange-600\/30 relative overflow-hidden mb-6"\n           >\n             <div className="absolute top-0 right-0 w-40 h-40 bg-white\/10 rounded-full blur-\[30px\] -mr-10 -mt-10 pointer-events-none"><\/div>\n             \n             <div className="flex items-start justify-between relative z-10">\n               <div>\n                  <p className="text-orange-100 text-\[10px\] font-bold uppercase tracking-widest mb-1">Solde Disponible<\/p>\n                  <h2 className="text-3xl font-black tracking-tight">\{formatCurrency\(Number\(user.balance\)\)\}<\/h2>\n               <\/div>\n               <div className="w-10 h-10 bg-white\/20 rounded-full flex items-center justify-center backdrop-blur-md">\n                  <ArrowDownToLine className="w-5 h-5 text-white" \/>\n               <\/div>\n             <\/div>\n           <\/motion\.div>\n           \n           <div className="bg-white rounded-\[32px\] p-6 shadow-lg shadow-slate-200\/50 border border-slate-100 space-y-5">/,
  `<form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-br from-orange-700 to-orange-600 rounded-[32px] p-6 shadow-xl shadow-orange-600/20 border border-orange-600/30 relative overflow-hidden text-white"
           >
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
             
             <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Actuel</p>
                  <p className="text-3xl font-black">{formatCurrency(Number(user.balance))}</p>
               </div>
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner">
                  <Wallet className="w-6 h-6 text-white" />
               </div>
             </div>
           </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-sm font-medium flex items-start gap-3 shadow-sm"
            >
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

           <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">`
);

text = text.replace(
  /               <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">\n                 <input \n                   type="number" \n                   value=\{amount\}\n                   onChange=\{\(e\) => setAmount\(e\.target\.value\)\}\n                   placeholder="Montant à retirer \(FCFA\)"\n                   className="w-full bg-transparent outline-none text-slate-900 font-bold placeholder-slate-400"\n                   required\n                 \/>\n               <\/div>/,
  `               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Montant à retirer</label>
                 <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                    <span className="text-slate-400 font-black text-2xl mr-3">FCFA</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-3xl font-black text-slate-900 placeholder-slate-300 outline-none"
                      placeholder="0"
                      required
                    />
                 </div>
               </div>`
);

text = text.replace(
  /               <div className="space-y-2">\n                 <label className="text-\[11px\] font-bold uppercase tracking-widest text-slate-500 px-1">Mot de passe de sécurité<\/label>\n                 <div className="relative">\n                   <div className="absolute left-4 top-1\/2 -translate-y-1\/2 text-slate-400">\n                     <Lock className="w-5 h-5" \/>\n                   <\/div>\n                   <input \n                     type="password" \n                     value=\{password\}\n                     onChange=\{\(e\) => setPassword\(e\.target\.value\)\}\n                     placeholder="Votre mot de passe"\n                     className="w-full bg-slate-50 border-2 border-slate-100 focus:border-orange-600 focus:bg-white rounded-2xl px-4 py-4 pl-12 text-slate-900 font-bold placeholder-slate-300 outline-none transition-all shadow-inner"\n                     required\n                   \/>\n                 <\/div>\n               <\/div>/,
  `               <div className="space-y-2">
                 <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">Mot de passe de sécurité</label>
                 <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">
                    <Lock className="w-5 h-5 text-slate-400 mr-3" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-slate-900 placeholder-slate-300 outline-none"
                      required
                    />
                 </div>
               </div>`
);

text = text.replace(
  /               <button \n                 type="submit" \n                 disabled=\{loading\}\n                 className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-orange-600\/30 flex items-center justify-center disabled:opacity-70 mt-6"\n               >\n                 \{loading \? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"><\/div> : 'Confirmer le retrait'\}\n               <\/button>/,
  `               <div className="pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
                 >
                   {loading ? 'Traitement...' : 'Confirmer le retrait'}
                 </button>
               </div>`
);

text = text.replace(
  /           <\/div>\n          <\/form>\n        <\/motion\.div>\n      \)}/m,
  `           </div>\n          </form>\n      )}`
);

fs.writeFileSync('src/pages/Withdraw.tsx', text);
console.log('Fixed withdraw ui');
