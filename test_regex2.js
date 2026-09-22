import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Use string replacement instead of regex
const oldStr = '<img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-90" />';

const newStr = `<img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                   <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                     <Server className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                   </div>`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Done string replace.");
