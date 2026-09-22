import fs from 'fs';

let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

const oldGetPlanName = /const getPlanName = \(amount: number\) => \{[\s\S]*?return 'Pack Élevage';\s*\};/m;
const newGetPlanName = `const getPlanName = (amount: number) => {
    const amt = Number(amount);
    if (amt === 3000) return 'Cloud Node Alpha';
    if (amt === 7000) return 'Cloud Node Beta';
    if (amt === 15000) return 'Serveur IA Standard';
    if (amt === 31000) return 'Serveur IA Premium';
    if (amt === 63000) return 'Cluster Data Pro';
    if (amt === 125000) return 'Cluster Data Max';
    if (amt === 249000) return 'Supercalculateur V1';
    if (amt === 497000) return 'Quantum Node V2';
    return 'Serveur Tech';
  };`;

if (oldGetPlanName.test(code)) {
    code = code.replace(oldGetPlanName, newGetPlanName);
    // Also let's change any agriculture fallback image to tech
    code = code.replace(/"https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800"/g, '"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"');
    fs.writeFileSync('src/pages/Products.tsx', code);
    console.log("Updated Products.tsx");
}

