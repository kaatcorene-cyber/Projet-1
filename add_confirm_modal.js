import fs from 'fs';
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add confirmModal state
const statePattern = /const \[loading, setLoading\] = useState\(false\);\s*const \[message, setMessage\]/;
if (content.match(statePattern)) {
   content = content.replace(
      statePattern, 
      "const [loading, setLoading] = useState(false);\n  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);\n  const [message, setMessage]"
   );
}

// 2. Add confirmModal UI
const uiPattern = /{message && \(/;
if (content.match(uiPattern)) {
    content = content.replace(
        uiPattern,
        `{confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation</h3>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  setConfirmModal({...confirmModal, isOpen: false});
                  confirmModal.onConfirm();
                }}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
                disabled={loading}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {message && (`
    );
}

// 3. Replace handleTransaction and handleRemoveInvestment to use confirmModal
content = content.replace(
  /const handleRemoveInvestment = async \(id: string\) => {/,
  `const handleRemoveInvestment = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Voulez-vous vraiment supprimer cet investissement ?',
      onConfirm: async () => {
`
);
content = content.replace(
  /fetchData\(\);\s*setLoading\(false\);\s*};\s*\/\/ --- Transactions Handlers ---/,
  `fetchData();
    setLoading(false);
      }
    });
  };

  // --- Transactions Handlers ---`
);

// Transaction handler
content = content.replace(
  /const handleTransaction = async \(id: string, status: 'approved' \| 'rejected', type: string, amount: number, userId: string\) => {\n    try {/,
  `const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {
    const actionText = status === 'approved' ? 'approuver' : 'rejeter';
    const typeText = type === 'deposit' ? 'ce dépôt' : 'ce retrait';
    
    setConfirmModal({
      isOpen: true,
      message: \`Voulez-vous vraiment \${actionText} \${typeText} ?\`,
      onConfirm: async () => {
        try {`
);

content = content.replace(
  /fetchData\(\);\s*setLoading\(false\);\s*}\s*catch\s*\(err:\s*any\)\s*{\s*console.error\(err\);\s*setMessage\({ type: 'error', text: err.message }\);\s*setLoading\(false\);\s*}\s*};\s*\/\/ --- Plans Handlers ---/,
  `fetchData();
        setLoading(false);
        } catch(err: any) {
          console.error(err);
          setMessage({ type: 'error', text: err.message });
          setLoading(false);
        }
      }
    });
  };

  // --- Plans Handlers ---`
);

// handleUpdateBalance
content = content.replace(
  /const handleUpdateBalance = async \(id: string\) => {\n\s*try {/,
  `const handleUpdateBalance = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: \`Voulez-vous vraiment modifier ce solde ?\`,
      onConfirm: async () => {
        try {`
);

content = content.replace(
  /fetchData\(\);\s*setLoading\(false\);\s*}\s*catch\s*\(err:\s*any\)\s*{\s*setMessage\({ type: 'error', text: err.message }\);\s*setLoading\(false\);\s*}\s*};\s*const handleRoleChange/,
  `fetchData();
        setLoading(false);
        } catch(err: any) {
          setMessage({ type: 'error', text: err.message });
          setLoading(false);
        }
      }
    });
  };

  const handleRoleChange`
);

// handleDeleteUser
content = content.replace(
  /const handleDeleteUser = async \(id: string\) => {\n\s*try {/,
  `const handleDeleteUser = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: \`Voulez-vous vraiment supprimer cet utilisateur ?\`,
      onConfirm: async () => {
        try {`
);

content = content.replace(
  /setConfirmDeleteId\(null\);\s*fetchData\(\);\s*setLoading\(false\);\s*}\s*catch\s*\(err:\s*any\)\s*{\s*setMessage\({ type: 'error', text: err.message }\);\s*setLoading\(false\);\s*}\s*};\s*const handleRemoveInvestment/,
  `setConfirmDeleteId(null);
        fetchData();
        setLoading(false);
        } catch(err: any) {
          setMessage({ type: 'error', text: err.message });
          setLoading(false);
        }
      }
    });
  };
  
  const handleRemoveInvestment`
);



// 4. Reset overview metrics to 0
content = content.replace(
  /<p className="text-xl font-black text-red-700">{formatCurrency\(usersList.reduce\(\(acc, user\) => acc \+ \(Number\(user.balance\) \|\| 0\), 0\)\)}<\/p>/,
  `<p className="text-xl font-black text-red-700">{formatCurrency(0)}</p>`
);

content = content.replace(
  /<p className="text-xl font-black text-red-700">{formatCurrency\(transactions.filter\(t => t.type === 'withdrawal' && t.status === 'approved'\).reduce\(\(acc, t\) => acc \+ \(Number\(t.amount\) \|\| 0\), 0\)\)}<\/p>/,
  `<p className="text-xl font-black text-red-700">{formatCurrency(0)}</p>`
);

content = content.replace(
  /<p className="text-xl font-black text-amber-600">{formatCurrency\(transactions.filter\(t => t.type === 'deposit' && t.status === 'approved'\).reduce\(\(acc, t\) => acc \+ \(Number\(t.amount\) \|\| 0\), 0\)\)}<\/p>/,
  `<p className="text-xl font-black text-amber-600">{formatCurrency(0)}</p>`
);

content = content.replace(
  /<p className="text-xl font-black text-purple-600">{usersList.length}<\/p>/,
  `<p className="text-xl font-black text-purple-600">0</p>`
);


fs.writeFileSync('src/pages/Admin.tsx', content);

console.log('Modification completed');
