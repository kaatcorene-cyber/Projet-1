import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const bgRegex = /\{\/\* Top Header Background \*\/\}\s*<div className="absolute top-0 left-0 w-full h-\[280px\] bg-orange-600 rounded-b-\[40px\] shadow-md overflow-hidden pointer-events-none">/g;

const newBg = `{/* Top Header Background */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-orange-600 rounded-b-[40px] shadow-md overflow-hidden pointer-events-none">
         <img src="https://i.imgur.com/DW8MY2u.png" alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" onError={(e) => { e.currentTarget.style.display = 'none'; }} />`;

dash = dash.replace(bgRegex, newBg);
fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Header bg updated');
