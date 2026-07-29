import fs from 'fs';

let content = fs.readFileSync('src/pages/Invest.tsx', 'utf8');

// Replace alerts with toast
if (!content.includes('import toast')) {
  content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport toast from 'react-hot-toast';");
}

content = content.replace(/alert\('Souscription réussie !'\)/g, "toast.success('Souscription réussie !')");
content = content.replace(/alert\('Erreur lors de la souscription'\)/g, "toast.error('Erreur lors de la souscription')");
content = content.replace(/alert\('Solde insuffisant'\)/g, "toast.error('Solde insuffisant')");
content = content.replace(/alert\(error\.message\)/g, "toast.error(error.message)");

fs.writeFileSync('src/pages/Invest.tsx', content);

let layoutContent = fs.readFileSync('src/components/Layout.tsx', 'utf8');
if (!layoutContent.includes('import toast')) {
  layoutContent = layoutContent.replace("import { NavLink", "import toast from 'react-hot-toast';\nimport { NavLink");
}
layoutContent = layoutContent.replace(/alert\('Déconnecté'\)/g, "toast.success('Déconnecté avec succès')");
fs.writeFileSync('src/components/Layout.tsx', layoutContent);

console.log('patched toasts');
