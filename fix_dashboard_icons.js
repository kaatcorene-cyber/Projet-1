import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace(
  /<div className="w-10 h-10 rounded-full border-2 border-white\/20 shadow-sm bg-white flex items-center justify-center p-0.5 overflow-hidden">\s*<img src="\/app_icon.png" alt="Olam Agri" className="w-full h-full object-cover rounded-full" \/>\s*<\/div>/g,
  `<div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm bg-white flex items-center justify-center p-0.5 overflow-hidden text-lg">
               🌿
             </div>`
);
content = content.replace(
  /<h1 className="text-white text-2xl font-black tracking-wide">Olam Agri<\/h1>/g,
  `<h1 className="text-white text-2xl font-black tracking-wide flex items-center gap-2">Olam Agri <span>🇨🇮</span></h1>`
);
fs.writeFileSync('src/pages/Dashboard.tsx', content);
