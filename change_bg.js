import fs from 'fs';
let content = fs.readFileSync('src/components/AnimatedBackground.tsx', 'utf8');
content = content.replace('photo-1625246333195-78d9c38ad449', 'photo-1500382017468-9049fed747ef');
content = content.replace('opacity-30', 'opacity-40');
content = content.replace('backdrop-blur-[1px]', 'backdrop-blur-sm');
fs.writeFileSync('src/components/AnimatedBackground.tsx', content);
