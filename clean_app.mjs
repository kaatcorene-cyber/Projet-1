import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/const FRUIT_IMAGES = \[[^\]]*\];?/g, '');
// Replace any image properties in newPlans to use an empty string or just remove them, though not strictly necessary since the UI uses getPlanImage
fs.writeFileSync('src/App.tsx', content);
