import fs from 'fs';

const files = [
  'src/pages/Register.tsx',
  'src/pages/Team.tsx',
  'src/pages/History.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/Invest.tsx',
  'src/pages/Setup.tsx',
  'index.html',
  'metadata.json'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/Petrolimex/g, 'QUALCOMM');
    content = content.replace(/PETROLIMEX/g, 'QUALCOMM');
    content = content.replace(/3UdOmrc\.png/g, 'IWublbr.png');
    // Team stats
    if (f === 'src/pages/Team.tsx') {
        content = content.replace("Gagnez jusqu'à 28% de commissions", "Gagnez jusqu'à 23% de commissions");
        content = content.replace(">15%</span>", ">20%</span>");
        content = content.replace(">3%</span>", ">2%</span>");
        // For Level 3 it was 2%, change to 1%
        content = content.replace(">2%</span>", ">1%</span>"); // will only replace first occurrence of >2%</span>! wait
    }
    fs.writeFileSync(f, content);
  }
});
