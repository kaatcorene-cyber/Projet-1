import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace "Mon Profil" with "Olam Agri"
content = content.replace(
  '<h1 className="text-center text-white/80 text-sm font-bold uppercase tracking-widest mb-6">Mon Profil</h1>',
  '<h1 className="text-center text-white/80 text-sm font-bold uppercase tracking-widest mb-6">Olam Agri</h1>'
);

// Add generateUserId helper outside component if not there
if (!content.includes('generateUserId')) {
  content = content.replace(
    'export function Dashboard() {',
    `const generateUserId = (uuid) => {
  if (!uuid) return '000000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash).toString().substring(0, 6).padEnd(6, '0');
};

export function Dashboard() {`
  );
}

// Add ID under the phone/country
const infoRegex = /<div className="flex items-center gap-3 mt-2 text-slate-300 text-sm font-medium">\s*<span className="flex items-center gap-1"><Phone className="w-3\.5 h-3\.5" \/> \{user\?\.phone\}<\/span>\s*<span className="w-1 h-1 bg-slate-500 rounded-full"><\/span>\s*<span className="flex items-center gap-1"><MapPin className="w-3\.5 h-3\.5" \/> \{user\?\.country\}<\/span>\s*<\/div>/;

const newInfo = `<div className="flex flex-col items-center gap-1.5 mt-2 text-slate-300 text-sm font-medium">
             <div className="flex items-center gap-3">
               <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user?.phone}</span>
               <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
               <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.country}</span>
             </div>
             <div className="inline-flex items-center justify-center px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 text-white font-bold tracking-widest">
               ID : {generateUserId(user?.id)}
             </div>
          </div>`;

content = content.replace(infoRegex, newInfo);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
