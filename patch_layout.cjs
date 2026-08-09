const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace("import { FloatingSupport } from './FloatingSupport';", "");
code = code.replace("<FloatingSupport />", "");
code = code.replace("sessionStorage.removeItem('telegramModalShown');", "");

fs.writeFileSync('src/components/Layout.tsx', code);
