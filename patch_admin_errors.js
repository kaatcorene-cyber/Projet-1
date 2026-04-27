import fs from 'fs';

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// handleUpdateBalance
content = content.replace(/const handleUpdateBalance = async \(id: string\) => {([\s\S]*?fetchData\(\);\s*setLoading\(false\);\s*)}/g, 
`const handleUpdateBalance = async (id: string) => {
    try {
      $1
    } catch(err: any) {
      alert("Erreur: " + err.message);
      setLoading(false);
    }
  }`);

// handleDeleteUser
content = content.replace(/const handleDeleteUser = async \(id: string\) => {([\s\S]*?fetchData\(\);\s*setLoading\(false\);\s*)}/g, 
`const handleDeleteUser = async (id: string) => {
    try {
      $1
    } catch(err: any) {
      alert("Erreur: " + err.message);
      setLoading(false);
    }
  }`);

// handleTransaction (it's big)
const txStart = content.indexOf(`const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {`);
const txEndStr = `    fetchData();\n    setLoading(false);\n  };`;
const txEnd = content.indexOf(txEndStr, txStart);

if (txStart !== -1 && txEnd !== -1) {
    const txBody = content.substring(txStart, txEnd + txEndStr.length);
    const newTxBody = txBody.replace(/const handleTransaction = async \([\s\S]*?\) => {/, `const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {\n    try {`)
                            .replace(txEndStr, `    fetchData();\n    setLoading(false);\n    } catch(err: any) {\n      console.error(err);\n      alert("Erreur: " + err.message);\n      setLoading(false);\n    }\n  };`);
    content = content.replace(txBody, newTxBody);
}


fs.writeFileSync('src/pages/Admin.tsx', content);
