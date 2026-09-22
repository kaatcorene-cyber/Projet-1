import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const fruitMap = `
const FRUIT_IMAGES = [
  "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&w=800&q=80", // apples
  "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80", // oranges
  "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80", // strawberries
  "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&w=800&q=80", // bananas
  "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80", // pineapples
  "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=800&q=80", // watermelon
  "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80", // grapes
  "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"  // mangoes
];

const getPlanImage = (amount, idx) => {
  return FRUIT_IMAGES[idx % FRUIT_IMAGES.length];
};
`;

content = content.replace("export default function Revenues() {", fruitMap + "\nexport default function Revenues() {");

content = content.replace(/plan\.image \|\| "https:\/\/images\.unsplash\.com\/photo-1500595046743-cd271d694d30\?auto=format&fit=crop&q=80&w=800"/g, "getPlanImage(plan.amount, idx)");

fs.writeFileSync('src/pages/Revenues.tsx', content);
