import fs from 'fs';

function replaceInFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

replaceInFile('src/pages/Deposit.tsx', /OlamAgri/g, 'Olam Agri');
replaceInFile('src/pages/Login.tsx', /OlamAgri/g, 'Olam Agri');
replaceInFile('src/pages/Register.tsx', /OlamAgri/g, 'Olam Agri');

