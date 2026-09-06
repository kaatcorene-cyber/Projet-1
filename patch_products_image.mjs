import fs from 'fs';

let content = fs.readFileSync('src/pages/Products.tsx', 'utf-8');

// The active card on the Products page has the fallback image logic instead of our getPlanImage
content = content.replace(
  /<img referrerPolicy="no-referrer" src=\{plan\?\.image \|\| "https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800"\} alt="Plan"/g,
  '<img referrerPolicy="no-referrer" src={getPlanImage(inv.plan_amount)} alt="Plan"'
);

// We need to make sure getPlanImage is actually defined in Products.tsx. Let's add it right above CountdownTimer.
const fruitImagesFunc = `
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

const getPlanImage = (amount) => {
  const amt = Number(String(amount).replace(/\\D/g, ''));
  if (amt === 2000) return FRUIT_IMAGES[0];
  if (amt === 5000) return FRUIT_IMAGES[1];
  if (amt === 8000) return FRUIT_IMAGES[2];
  if (amt === 15000) return FRUIT_IMAGES[3];
  if (amt === 35000) return FRUIT_IMAGES[4];
  if (amt === 80000) return FRUIT_IMAGES[5];
  if (amt === 200000) return FRUIT_IMAGES[6];
  if (amt === 500000) return FRUIT_IMAGES[7];
  return FRUIT_IMAGES[0];
};
`;

if (!content.includes('getPlanImage =')) {
  content = content.replace("const CountdownTimer = ", fruitImagesFunc + "\nconst CountdownTimer = ");
}

fs.writeFileSync('src/pages/Products.tsx', content);
