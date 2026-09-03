import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /<p className="font-bold text-slate-900 flex items-center gap-2">\n                      \{u\.first_name\} \{u\.last_name\}\n                    <\/p>/g,
  `<p className="font-bold text-slate-900 flex items-center gap-2">
                      Id : {generateUserId(u.id)}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{u.first_name} {u.last_name}</p>`
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed bank id display');
