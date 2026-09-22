import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

const regexToReplace = /      \) : \(\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="bg-white rounded-\[32px\] p-8 shadow-lg shadow-slate-200\/50 border border-slate-100"\s*>\s*\{error && \([\s\S]*?\}\s*\)\}\s*<form onSubmit=\{handleSubmit\} className="space-y-6 relative z-10">\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="bg-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-orange-600\/30 relative overflow-hidden mb-6"\s*>\s*<div className="absolute top-0 right-0 w-40 h-40 bg-white\/10 rounded-full blur-\[30px\] -mr-10 -mt-10 pointer-events-none"><\/div>\s*<div className="flex items-start justify-between relative z-10">\s*<div>\s*<p className="text-orange-100 text-\[10px\] font-bold uppercase tracking-widest mb-1">Solde Disponible<\/p>\s*<h2 className="text-3xl font-black tracking-tight">\{formatCurrency\(Number\(user\.balance\)\)\}<\/h2>\s*<\/div>\s*<div className="w-10 h-10 bg-white\/20 rounded-full flex items-center justify-center backdrop-blur-md">\s*<ArrowDownToLine className="w-5 h-5 text-white" \/>\s*<\/div>\s*<\/div>\s*<\/motion\.div>\s*<div className="bg-white rounded-\[32px\] p-6 shadow-lg shadow-slate-200\/50 border border-slate-100 space-y-5">/m;

const match = withdraw.match(regexToReplace);
if (match) {
  const replacement = `      ) : (
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
  withdraw = withdraw.replace(regexToReplace, replacement);
  fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
  console.log('Fixed withdraw top render');
} else {
  console.log('Regex did not match');
}
