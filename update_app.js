import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { Proofs } from './pages/Proofs';", "import { Vault } from './pages/Vault';");
code = code.replace('<Route path="/preuves" element={<Proofs />} />', '<Route path="/coffre" element={<Vault />} />');
fs.writeFileSync('src/App.tsx', code);
