import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

const regex = /      \{success \? \([\s\S]*?\) : \(\s*<motion\.div[\s\S]*?className="bg-white rounded-\[32px\] p-8 shadow-lg shadow-slate-200\/50 border border-slate-100"\s*>\s*\{error && \([\s\S]*?\}\s*\)\}\s*<form onSubmit=\{handleSubmit\} className="space-y-6 relative z-10">\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="bg-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-orange-600\/30 relative overflow-hidden mb-6"\s*>\s*<div className="absolute top-0 right-0 w-40 h-40 bg-white\/10 rounded-full blur-\[30px\] -mr-10 -mt-10 pointer-events-none"><\/div>\s*<div className="flex items-start justify-between relative z-10">\s*<div>\s*<p className="text-orange-100 text-\[10px\] font-bold uppercase tracking-widest mb-1">Solde Disponible<\/p>\s*<h2 className="text-3xl font-black tracking-tight">\{formatCurrency\(Number\(user.balance\)\)\}<\/h2>\s*<\/div>\s*<div className="w-10 h-10 bg-white\/20 rounded-full flex items-center justify-center backdrop-blur-md">\s*<ArrowDownToLine className="w-5 h-5 text-white" \/>\s*<\/div>\s*<\/div>\s*<\/motion\.div>\s*<div className="bg-white rounded-\[32px\] p-6 shadow-lg shadow-slate-200\/50 border border-slate-100 space-y-5">/m;

const replacement = `      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100"
        >
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Demande envoyée !</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Votre demande de retrait a été enregistrée avec succès. Vous la recevrez sur votre compte sous peu.
          </p>
          <button 
            onClick={() => navigate('/history')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-colors"
          >
            Voir l'historique
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
           {/* Balance Card matching Deposit.tsx */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-br from-orange-700 to-orange-600 rounded-[32px] p-6 shadow-xl shadow-orange-600/20 border border-orange-600/30 relative overflow-hidden text-white"
           >
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
             
             <div className="flex items-start justify-between relative z-10">
               <div>
                  <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Actuel</p>
                  <p className="text-3xl font-black">{formatCurrency(Number(user?.balance || 0))}</p>
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

           <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">`;

const match = withdraw.match(regex);
if (match) {
  withdraw = withdraw.replace(regex, replacement);
  
  // also fix the input for amount and the submit button
  
  // Replace amount input
  const inputRegex = /<div className="bg-slate-50 border-2 border-slate-100 focus-within:border-orange-600 focus-within:bg-white rounded-2xl p-4 transition-all duration-300 flex items-center shadow-inner">\s*<input\s*type="number"\s*value=\{amount\}\s*onChange=\{\(e\) => setAmount\(e\.target\.value\)\}\s*placeholder="Montant à retirer \(FCFA\)"\s*className="w-full bg-transparent outline-none text-slate-900 font-bold placeholder-slate-400"\s*required\s*\/>\s*<\/div>/;
  
  const newInput = `<div className="space-y-2">
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
               </div>`;
               
  withdraw = withdraw.replace(inputRegex, newInput);
  
  // Replace submit button
  const submitRegex = /<button\s*type="submit"\s*disabled=\{loading\}\s*className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-orange-600\/30 flex items-center justify-center disabled:opacity-70 mt-6"\s*>\s*\{loading \? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"><\/div> : 'Confirmer le retrait'\}\s*<\/button>/;
  
  const newSubmit = `<div className="pt-2">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] flex justify-center items-center gap-2"
                 >
                   {loading ? 'Traitement...' : 'Confirmer le retrait'}
                 </button>
               </div>`;
  
  withdraw = withdraw.replace(submitRegex, newSubmit);
  
  withdraw = withdraw.replace(/           <\/div>\n          <\/form>\n        <\/motion\.div>\n      \)}/m, `           </div>\n          </form>\n      )}`);
  
  fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
  console.log('Fixed withdraw layout');
} else {
  console.log('Regex did not match');
}
