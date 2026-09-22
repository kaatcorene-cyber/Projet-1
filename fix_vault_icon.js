import fs from 'fs';
let code = fs.readFileSync('src/pages/Vault.tsx', 'utf8');

code = code.replace(
  `      <div className="flex items-center gap-3 mb-8 relative z-10">\n        <!-- \n          -->\n        </div>\n        <div>`,
  `      <div className="flex items-center gap-3 mb-8 relative z-10">\n        <div>`
);

code = code.replace(
  `<div className="hidden w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">`,
  `<!-- `
);

code = code.replace(
  `<Key className="w-6 h-6 text-purple-500" />`,
  `-->`
);

code = code.replace(
  `<!-- \n          -->\n        </div>\n        <div>`,
  `<div>`
);

fs.writeFileSync('src/pages/Vault.tsx', code);
