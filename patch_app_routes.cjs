const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { Proofs }")) {
  content = content.replace("import { History } from './pages/History';", "import { History } from './pages/History';\nimport { Proofs } from './pages/Proofs';");
}

if (!content.includes("<Route path=\"/preuves\"")) {
  content = content.replace("<Route path=\"/history\" element={<History />} />", "<Route path=\"/history\" element={<History />} />\n          <Route path=\"/preuves\" element={<Proofs />} />");
}

fs.writeFileSync('src/App.tsx', content);
