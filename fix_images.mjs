import fs from 'fs';

let content = fs.readFileSync('src/pages/Revenues.tsx', 'utf-8');

const oldFunc = `const getPlanImage = (amount, idx) => {
  return FRUIT_IMAGES[idx % FRUIT_IMAGES.length];
};`;

const newFunc = `const getPlanImage = (amount) => {
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
};`;

content = content.replace(oldFunc, newFunc);
content = content.replace(/getPlanImage\(plan\.amount, idx\)/g, "getPlanImage(plan.amount)");
content = content.replace(/getPlanImage\(inv\.plan_amount, inv\.id\)/g, "getPlanImage(inv.plan_amount)");

fs.writeFileSync('src/pages/Revenues.tsx', content);
