import fs from 'fs';

let lines = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes(') : ('));
const endIndex = lines.findIndex(l => l.includes('<div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-5">'));

console.log('startIndex', startIndex);
console.log('endIndex', endIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `      ) : (
        <div className="space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-6">`;
          
  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  
  let result = lines.join('\n');
  
  // also fix the closing tag which should be </div></form> instead of </form></motion.div>
  result = result.replace(/<\/form>\n      \)}/m, `</div>\n          </form>\n        </div>\n      )}`);
  result = result.replace(/           <\/div>\n          <\/form>\n        <\/motion\.div>\n      \)}/m, `           </div>\n          </form>\n        </div>\n      )}`);
  
  fs.writeFileSync('src/pages/Withdraw.tsx', result);
  console.log('Done!');
}

