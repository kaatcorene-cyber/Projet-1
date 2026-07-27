import fs from 'fs';

let content = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regTopHtml = `
    <div className="h-[100dvh] relative flex flex-col overflow-hidden bg-slate-50">
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
`;

// we need to replace from <div className="h-[100dvh]..." to <motion.div ... className="w-full"> and the <div ... <img ... </div>
const startIdx = content.indexOf('<div className="h-[100dvh] relative flex flex-col justify-center px-6 overflow-hidden bg-transparent">');
const endIdx = content.indexOf('          </div>\n            \n\n          <form', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + regTopHtml + content.substring(endIdx + "          </div>\n            \n".length);
}

fs.writeFileSync('src/pages/Register.tsx', content);
