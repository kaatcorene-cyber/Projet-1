import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(
/const BANNER_IMAGES = \[[\s\S]*?\];/,
`const BANNER_IMAGES = [
  "https://i.imgur.com/hhhcYjsh.jpg",
  "https://i.imgur.com/DHEk095h.jpg",
  "https://i.imgur.com/cjjQb0ph.jpg",
  "https://i.imgur.com/cq6VlWnh.jpg"
];`
);

fs.writeFileSync('src/pages/Home.tsx', content);
