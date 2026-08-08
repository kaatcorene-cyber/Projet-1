const fs = require('fs');
let content = fs.readFileSync('src/lib/utils.ts', 'utf8');

const regex = /export const getPlanName = \([\s\S]*?return 'Projet Agricole';\n\};\n/g;
content = content.replace(regex, `export const getPlanName = (amount: number) => {
    const amt = Number(amount);
    if (amt === 3000) return 'Héliciculture';
    if (amt === 7000) return 'Pisciculture';
    if (amt === 15000) return 'Aviculture';
    if (amt === 31000) return 'Cuniculture';
    if (amt === 63000) return 'Élevage porcin';
    if (amt === 125000) return 'Élevage ovin';
    if (amt === 249000) return 'Élevage caprin';
    if (amt === 497000) return 'Élevage bovin';
    return 'Pack Élevage';
};
`);

fs.writeFileSync('src/lib/utils.ts', content);
