import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/Limak/g, 'OlamAgri');
        content = content.replace(/limakpayement@gmail\.com/g, 'olamagripayement@gmail.com');
        content = content.replace(/20bDoyM\.png/g, '2QzGpuQ.png');
        fs.writeFileSync(filePath, content);
    }
}

replaceInFile('src/pages/Deposit.tsx');
replaceInFile('src/pages/Setup.tsx');
replaceInFile('src/pages/Login.tsx');
replaceInFile('src/pages/Invest.tsx');
replaceInFile('src/pages/Dashboard.tsx');
