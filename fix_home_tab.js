import fs from 'fs';
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The Coffre item in quickLinks: { icon: Key, label: 'Coffre', path: '/coffre', color: 'bg-purple-500' },
code = code.replace(
  "{ icon: Key, label: 'Coffre', path: '/coffre', color: 'bg-purple-500' },",
  "{ icon: null, image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400', label: 'Coffre', path: '/coffre', color: 'bg-purple-500' },"
);

// Update quickLinks mapping
const oldMapping = `<div className={\`w-14 h-14 rounded-2xl \${link.color} flex items-center justify-center text-white shadow-lg shadow-slate-200/50 group-hover:scale-105 transition-transform\`}>
               <link.icon className="w-6 h-6" />
            </div>`;
const newMapping = `<div className={\`w-14 h-14 rounded-2xl \${link.color} flex items-center justify-center text-white shadow-lg shadow-slate-200/50 group-hover:scale-105 transition-transform overflow-hidden\`}>
              {link.image ? (
                <img src={link.image} alt={link.label} className="w-full h-full object-cover" />
              ) : (
                link.icon && <link.icon className="w-6 h-6" />
              )}
            </div>`;

code = code.replace(oldMapping, newMapping);

fs.writeFileSync('src/pages/Home.tsx', code);
