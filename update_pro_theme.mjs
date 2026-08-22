import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Make backgrounds elegant glassmorphism
  content = content.replace(/bg-zinc-900(?!(\/|\]| border-zinc-800))/g, 'bg-zinc-900/80 backdrop-blur-xl border border-zinc-800');
  
  fs.writeFileSync(filePath, content);
}

// Ensure the AnimatedBackground is extremely professional and subtle
let animatedBgPath = path.join(process.cwd(), 'src/components/AnimatedBackground.tsx');
let animatedBg = fs.readFileSync(animatedBgPath, 'utf-8');
animatedBg = animatedBg.replace('opacity-30', 'opacity-20 mix-blend-luminosity');
animatedBg = animatedBg.replace('from-black via-black/80 to-black/90', 'from-black/95 via-black/85 to-black/95');
fs.writeFileSync(animatedBgPath, animatedBg);

console.log("Applied glassmorphism theme and pro layout.");
