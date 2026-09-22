import fs from 'fs';

// --- Dashboard ---
let dashContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashContent = dashContent.replace(
  /<h1 className="text-2xl text-white font-black tracking-tight">\s*\{user\?\.first_name \|\| 'Utilisateur'\}\s*<\/h1>/,
  '<h1 className="text-2xl text-white font-black tracking-tight">\n            ID : {generateUserId(user?.id)}\n          </h1>'
);

// Remove the ID div from below
dashContent = dashContent.replace(
  /<div className="flex flex-col items-center gap-1\.5 mt-2 text-slate-300 text-sm font-medium">\s*<div className="flex items-center gap-3">\s*<span className="flex items-center gap-1"><Phone className="w-3\.5 h-3\.5" \/> \{user\?\.phone\}<\/span>\s*<span className="w-1 h-1 bg-slate-500 rounded-full"><\/span>\s*<span className="flex items-center gap-1"><MapPin className="w-3\.5 h-3\.5" \/> \{user\?\.country\}<\/span>\s*<\/div>\s*<div className="inline-flex items-center justify-center px-2 py-1 bg-white\/10 rounded-lg backdrop-blur-sm border border-white\/10 text-white font-bold tracking-widest">\s*ID : \{generateUserId\(user\?\.id\)\}\s*<\/div>\s*<\/div>/,
  `<div className="flex items-center gap-3 mt-2 text-slate-300 text-sm font-medium">
             <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user?.phone}</span>
             <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
             <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.country}</span>
          </div>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashContent);

// --- Register ---
let regContent = fs.readFileSync('src/pages/Register.tsx', 'utf8');
regContent = regContent.replace(
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2072&auto=format&fit=crop',
  'https://i.imgur.com/I2qt7oH.jpg'
);
fs.writeFileSync('src/pages/Register.tsx', regContent);

// --- Login ---
let loginContent = fs.readFileSync('src/pages/Login.tsx', 'utf8');
loginContent = loginContent.replace(
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069&auto=format&fit=crop',
  'https://i.imgur.com/tCl7xi9.jpg'
);
fs.writeFileSync('src/pages/Login.tsx', loginContent);

console.log("Done");
