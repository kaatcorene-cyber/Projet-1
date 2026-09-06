import fs from 'fs';

function applyDarkMode(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/bg-slate-50/g, 'bg-[#03296c]');
  content = content.replace(/bg-white(?!\/)/g, 'bg-white/10'); // don't replace bg-white/10
  content = content.replace(/border-slate-200/g, 'border-white/20');
  content = content.replace(/border-slate-100/g, 'border-white/10');
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-700/g, 'text-white/90');
  content = content.replace(/text-slate-600/g, 'text-white/80');
  content = content.replace(/text-slate-500/g, 'text-blue-200/60');
  content = content.replace(/bg-slate-100/g, 'bg-white/5');
  content = content.replace(/bg-slate-200/g, 'bg-white/10');
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/pages/Revenues.tsx',
  'src/pages/Home.tsx',
  'src/components/BottomNav.tsx',
  'src/pages/Profile.tsx',
  'src/pages/History.tsx',
  'src/pages/Deposit.tsx',
  'src/pages/Withdraw.tsx',
  'src/pages/Team.tsx',
  'src/pages/Commissions.tsx',
  'src/pages/Bank.tsx',
  'src/pages/Vault.tsx',
  'src/pages/Setup.tsx',
  'src/pages/Products.tsx',
  'src/pages/About.tsx',
  'src/pages/Admin.tsx',
  'src/components/Layout.tsx',
  'src/index.css'
];

files.forEach(applyDarkMode);
