import fs from 'fs';

let content = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

// Add state
content = content.replace(
  /const \[infoLoaded, setInfoLoaded\] = useState\(false\);/,
  `const [infoLoaded, setInfoLoaded] = useState(false);
  const [maxWithdrawable, setMaxWithdrawable] = useState<number | null>(null);`
);

// Add fetch logic in loadInfo
const fetchLogic = `
        // Fetch withdrawable max
        const { data: txs } = await supabase.from('transactions').select('type, amount, status').eq('user_id', user.id);
        let totalDeposits = 0;
        let totalInvestments = 0;
        if (txs) {
            for (const tx of txs) {
                if (tx.type === 'deposit' && tx.status === 'approved') totalDeposits += Number(tx.amount);
                if (tx.type === 'investment' && tx.status === 'completed') totalInvestments += Number(tx.amount);
            }
        }
        const uninvested = Math.max(0, totalDeposits - totalInvestments);
        const withdrawable = Math.max(0, Number(user.balance) - uninvested);
        setMaxWithdrawable(withdrawable);
`;

content = content.replace(
  /setInfoLoaded\(true\);\n\s*return;\n\s*\}\n\s*\} catch \(e\) \{\}\n\s*\}/,
  `// We don't early return here anymore because we need to calculate maxWithdrawable below
            }
          } catch (e) {}
        }`
);

content = content.replace(
  /setInfoLoaded\(true\);\n\s*\};\n\s*loadInfo\(\);/,
  fetchLogic + `\n        setInfoLoaded(true);\n      };\n      loadInfo();`
);

// Add validation in handleSubmit
const validationLogic = `
    if (maxWithdrawable !== null && numAmount > maxWithdrawable) {
      setError('Vous ne pouvez retirer que vos gains journaliers et bonus de parrainage. Veuillez investir vos recharges.');
      return;
    }
`;

content = content.replace(
  /if \(numAmount > Number\(user\.balance\)\) \{\n\s*setError\('Solde insuffisant pour ce retrait.'\);\n\s*return;\n\s*\}/,
  `if (numAmount > Number(user.balance)) {
      setError('Solde insuffisant pour ce retrait.');
      return;
    }
${validationLogic}`
);

// Update UI to show maxWithdrawable if it's less than balance
const uiLogic = `
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1">Solde Retirable</p>
                <h2 className="text-3xl font-black tracking-tight">{formatCurrency(maxWithdrawable !== null ? maxWithdrawable : Number(user?.balance || 0))}</h2>
`;

content = content.replace(
  /<p className="text-orange-100 text-\[10px\] font-bold uppercase tracking-widest mb-1">Solde Disponible<\/p>\n\s*<h2 className="text-3xl font-black tracking-tight">\{formatCurrency\(Number\(user\?\.balance \|\| 0\)\)\}<\/h2>/,
  uiLogic
);

content = content.replace(
  /<p className="text-orange-100 text-\[10px\] font-bold uppercase tracking-widest mb-1">Solde Actuel<\/p>\n\s*<p className="text-3xl font-black">\{formatCurrency\(Number\(user\?\.balance \|\| 0\)\)\}<\/p>/,
  uiLogic
);

fs.writeFileSync('src/pages/Withdraw.tsx', content);
