import fs from 'fs';

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldHeader = `<div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
             <img src="/olam_logo_final.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover bg-white" />
             <h1 className="text-white text-xl font-black tracking-wide">Olam Agri</h1>
           </div>
        </div>`;

const newHeader = `<div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3">
             <img 
                src="https://i.imgur.com/DW8MY2u.png" 
                onError={(e) => { e.currentTarget.src = "/olam_logo_final.png"; }}
                alt="Logo" 
                className="w-10 h-10 rounded-full border-2 border-white/20 shadow-sm object-cover bg-white" 
             />
             <h1 className="text-white text-xl font-black tracking-wide relative">
                Olam Agri
                {/* Fallback absolute image in case they wanted it behind the text */}
                <div className="absolute inset-0 opacity-0 bg-[url('https://i.imgur.com/DW8MY2u.png')] bg-cover"></div>
             </h1>
           </div>
        </div>`;

dash = dash.replace(oldHeader, newHeader);
fs.writeFileSync('src/pages/Dashboard.tsx', dash);
console.log('Logo updated');
