const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `  const quickLinks = [
    { icon: Info, label: 'Info', path: '#info', color: 'bg-blue-500' },
    { icon: ArrowDownToLine, label: 'Recharger', path: '/deposit', color: 'bg-emerald-500' },
    { icon: Gift, label: 'Commissions', path: '/commissions', color: 'bg-orange-500' },
    { icon: ImageIcon, label: 'Preuves', path: '#preuves', color: 'bg-purple-500' },
  ];`;

const replacement = `  const quickLinks = [
    { icon: Clock, label: 'Historique', path: '/history', color: 'bg-blue-500' },
    { icon: ArrowDownToLine, label: 'Recharger', path: '/deposit', color: 'bg-emerald-500' },
    { icon: Gift, label: 'Commissions', path: '/commissions', color: 'bg-orange-500' },
    { icon: ImageIcon, label: 'Preuves', path: '/preuves', color: 'bg-purple-500' },
  ];`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Home.tsx', content);
