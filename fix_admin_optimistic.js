import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. handleTransaction
admin = admin.replace(
  /    setLoading\(true\);\n    await supabase\.from\('transactions'\)\.update\(\{ status \}\)\.eq\('id', id\);/m,
  `    setLoading(true);
    // Optimistic update
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await supabase.from('transactions').update({ status }).eq('id', id);`
);

// 2. handleRoleChange
admin = admin.replace(
  /  const handleRoleChange = async \(id: string, newRole: string\) => \{\n    await supabase\.from\('users'\)\.update\(\{ role: newRole \}\)\.eq\('id', id\);\n    fetchData\(\);\n  \};/m,
  `  const handleRoleChange = async (id: string, newRole: string) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    await supabase.from('users').update({ role: newRole }).eq('id', id);
    fetchData(false);
  };`
);

// 3. handleUpdateBalance
admin = admin.replace(
  /    const numBal = Number\(editBalance\);\n    await supabase\.from\('users'\)\.update\(\{ balance: numBal \}\)\.eq\('id', id\);\n    setEditingUserId\(null\);\n    fetchData\(\);/m,
  `    const numBal = Number(editBalance);
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, balance: numBal } : u));
    await supabase.from('users').update({ balance: numBal }).eq('id', id);
    setEditingUserId(null);
    fetchData(false);`
);

// 4. handleDeleteUser
admin = admin.replace(
  /    await supabase\.from\('users'\)\.delete\(\)\.eq\('id', id\);\n    fetchData\(\);/m,
  `    await supabase.from('users').delete().eq('id', id);
    setUsersList(prev => prev.filter(u => u.id !== id));
    fetchData(false);`
);

// 5. handleClearUserBank
admin = admin.replace(
  /      onConfirm: async \(\) => \{\n        setLoading\(true\);\n        setUsersList\(prev => prev\.map\(u => u\.id === id \? \{ \.\.\.u, bank_method: null, bank_account_name: null, bank_account_number: null \} : u\)\);\n/m,
  `      onConfirm: async () => {
        setLoading(true);
        setUsersList(prev => prev.map(u => u.id === id ? { ...u, bank_method: null, bank_account_name: null, bank_account_number: null } : u));
`
);

// For all other `fetchData()` let's change them to `fetchData(false)` so it doesn't show giant loader if there was one, except initial load.
admin = admin.replace(/fetchData\(\);/g, 'fetchData(false);');

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed optimistic updates');
