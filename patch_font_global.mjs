import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf-8');
content = content.replace('class="bg-gray-50 text-gray-900 overflow-x-hidden"', 'class="bg-gray-50 text-gray-900 overflow-x-hidden antialiased selection:bg-brand-500 selection:text-white"');
fs.writeFileSync('index.html', content);

let cssContent = fs.readFileSync('src/index.css', 'utf-8');
if (!cssContent.includes('Montserrat')) {
  cssContent = cssContent.replace(
    /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Outfit.*?display=swap'\);/g,
    "@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');"
  );
  cssContent = cssContent.replace(/'Outfit'/g, "'Montserrat'");
}
fs.writeFileSync('src/index.css', cssContent);
