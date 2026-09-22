import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldUIStart = `{activeTab === 'proofs' && (`;

const newUI = `{activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Créer un Coffre (Code)</h2>
            <form onSubmit={handleAddVault} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Code Unique</label>
                <input
                  type="text"
                  value={newVaultCode}
                  onChange={e => setNewVaultCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 font-bold tracking-widest uppercase"
                  placeholder="EX: CADEAU1000"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Montant Total à Distribuer (FCFA)</label>
                <input
                  type="number"
                  value={newVaultAmount}
                  onChange={e => setNewVaultAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="1000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAddingVault}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center"
              >
                {isAddingVault ? 'Création...' : 'Créer le coffre'}
              </button>
            </form>
          </div>

          <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Coffres existants ({vaultList.length})</h2>
            <div className="space-y-4">
              {vaultList.map((vault, i) => (
                <div key={i} className="flex gap-4 border border-slate-100 rounded-2xl p-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Key className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 tracking-wider uppercase">{vault.code}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Restant: <span className="text-emerald-600 font-bold">{formatCurrency(vault.remaining_amount)}</span> / {formatCurrency(vault.total_amount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{vault.claimed_by?.length || 0} réclamations</p>
                  </div>
                  <button onClick={() => handleDeleteVault(vault.code)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl h-fit">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}`;

// Since the old block is quite large, it's easier to find its start and end.
const lines = code.split('\n');
let startIndex = -1;
let endIndex = -1;
let openBrackets = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("{activeTab === 'proofs' && (")) {
    startIndex = i;
    openBrackets = 1; // Actually there's one open bracket from `(`
  } else if (startIndex !== -1) {
    if (lines[i].includes('}')) {
       // Just find the end of this tab block by checking for the end of the `)`
    }
  }
}
// Actually, simpler to just replace using regex or string block
let blockMatch = code.match(/{activeTab === 'proofs' && \([\s\S]*?<\/button>\s*<\/div>\s*\}\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/);

if (blockMatch) {
  code = code.replace(blockMatch[0], newUI);
  fs.writeFileSync('src/pages/Admin.tsx', code);
} else {
  console.log("Could not find the exact block to replace. Trying a simpler match.");
  let b2 = code.match(/{activeTab === 'proofs' && \([\s\S]*?\)\}/); // Might match too little or too much, risky.
  // Instead, let's use sed in the next step if this fails.
}
