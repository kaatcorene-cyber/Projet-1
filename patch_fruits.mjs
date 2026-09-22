import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const newFruitImages = `
const FRUIT_IMAGES = [
  "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80", // 🍓 Fraise
  "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80", // 🍉 Pastèque
  "https://images.unsplash.com/photo-1585059895524-72359e06138a?auto=format&fit=crop&w=800&q=80", // 🥝 Kiwi
  "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80", // 🍇 Raisin
  "https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=800&q=80", // 🍒 Cerise
  "https://images.unsplash.com/photo-1590502593747-4229879f758f?auto=format&fit=crop&w=800&q=80", // 🍋 Citron
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80", // 🍏 Pomme Verte
  "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80"  // 🍌 Banane
];
`;

content = content.replace(/const FRUIT_IMAGES = \[[\s\S]*?\];/m, newFruitImages.trim());

fs.writeFileSync('src/pages/Revenues.tsx', content);

// Update App.tsx too just in case
let appContent = fs.readFileSync('src/App.tsx', 'utf-8');
appContent = appContent.replace(/const FRUIT_IMAGES = \[[\s\S]*?\];/m, newFruitImages.trim());
fs.writeFileSync('src/App.tsx', appContent);

