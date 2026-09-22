import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf-8');

// Replace Outfit/JetBrains imports with Montserrat and Lora or just Montserrat/Inter
content = content.replace(
  /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Outfit.*?display=swap'\);/g,
  "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');"
);

// Replace font-family definitions
content = content.replace(/'Outfit'/g, "'Montserrat'");
content = content.replace(/'JetBrains Mono'/g, "'Space Mono'");

fs.writeFileSync('src/index.css', content);
