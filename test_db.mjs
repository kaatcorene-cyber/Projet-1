import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');
content = content.replace(/const getPlanImage = \(amount\) => {[\s\S]*?};/, `const getPlanImage = (amount) => {
  const amt = Number(String(amount).replace(/\\D/g, ''));
  if (amt === 2000) return "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80"; // Fraise
  if (amt === 5000) return "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80"; // Pastèque
  if (amt === 8000) return "https://images.unsplash.com/photo-1585059895524-72359e06138a?auto=format&fit=crop&w=800&q=80"; // Kiwi
  if (amt === 15000) return "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80"; // Raisin
  if (amt === 35000) return "https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=800&q=80"; // Cerise
  if (amt === 80000) return "https://images.unsplash.com/photo-1590502593747-4229879f758f?auto=format&fit=crop&w=800&q=80"; // Citron
  if (amt === 200000) return "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"; // Pomme
  if (amt === 500000) return "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80"; // Banane
  return "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80";
};`);
fs.writeFileSync('src/pages/Revenues.tsx', content);
