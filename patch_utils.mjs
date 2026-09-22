import fs from 'fs';
let content = fs.readFileSync('src/lib/utils.ts', 'utf-8');

content = content.replace(
`export const getPlanName = (amount: number) => {
    return 'PACK INVESTISSEMENT';
};`,
`export const getPlanName = (amount: number) => {
  switch (amount) {
    case 2000: return '🍓 Jus de Fraise';
    case 5000: return '🍉 Jus de Pastèque';
    case 8000: return '🥝 Jus de Kiwi';
    case 15000: return '🍇 Vin de Raisin';
    case 35000: return '🍒 Vin de Cerise';
    case 80000: return '🍋 Jus de Citron';
    case 200000: return '🍏 Jus de Pomme Verte';
    case 500000: return '🍌 Jus de Banane';
    default: return 'PACK INVESTISSEMENT';
  }
};`
);
fs.writeFileSync('src/lib/utils.ts', content);
