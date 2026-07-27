import fs from 'fs';
let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regex = /<div className="h-\[100dvh\] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent">[\s\S]*?<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="w-full"\s*>\s*<div className="w-full h-24 mb-4 rounded-2xl overflow-hidden shadow-sm border border-slate-200">\s*<img src="https:\/\/i\.imgur\.com\/K9gVSeO\.jpg" alt="OlamAgri Banner" className="w-full h-full object-cover" \/>\s*<\/div>\s*<form/m;

const newHtml = `<div className="h-[100dvh] relative flex flex-col overflow-hidden bg-slate-50">
      <div className="w-full h-48 sm:h-56 shrink-0 relative">
        <img src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2072&auto=format&fit=crop" alt="OlamAgri Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50"></div>
      </div>
      <div className="flex-1 relative z-10 w-full max-w-sm mx-auto flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <form`;

if(regex.test(content)) {
  content = content.replace(regex, newHtml);
  fs.writeFileSync('src/pages/Register.tsx', content);
  console.log("Success");
} else {
  console.log("No match found");
}
