import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

withdraw = withdraw.replace(
  /  useEffect\(\(\) => \{\n    if \(infoLoaded && !withdrawalInfo\) \{\n      navigate\('\/bank'\);\n    \}\n  \}, \[infoLoaded, withdrawalInfo, navigate\]\);\n/m,
  ""
);

const missingBankBlock = `
  if (!infoLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (infoLoaded && !withdrawalInfo) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 pt-12 pb-24 font-sans text-slate-900 max-w-lg mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Retirer vos gains</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Retrait</h1>
          </div>
        </header>

        <div className="bg-orange-600 text-white rounded-3xl p-6 shadow-xl shadow-orange-600/30 relative overflow-hidden mb-6">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[30px] -mr-10 -mt-10 pointer-events-none"></div>
           <div className="flex items-start justify-between relative z-10">
             <div>
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Disponible</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(Number(user?.balance || 0))}</h2>
             </div>
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <ArrowDownToLine className="w-5 h-5 text-white" />
             </div>
           </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Compte de retrait manquant</h2>
          <p className="text-slate-500 mb-8 text-sm">Veuillez d'abord configurer vos informations de retrait avant de pouvoir retirer vos gains.</p>
          <button onClick={() => navigate('/bank')} className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-colors">
            Configurer mon compte
          </button>
        </div>
      </div>
    );
  }
`;

withdraw = withdraw.replace(
  /  if \(!infoLoaded \|\| !withdrawalInfo\) \{\n    return \(\n      <div className="min-h-screen bg-slate-50 flex items-center justify-center">\n        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"><\/div>\n      <\/div>\n    \);\n  \}/m,
  missingBankBlock
);

fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
console.log('Restored orange balance band to missing bank screen');
