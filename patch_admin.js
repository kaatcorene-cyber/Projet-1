import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
code = code.replace(
  'const text = `${newProofImageUrl} vient de retirer ${newProofTestimonial} FCFA avec succès !`;',
  'const text = `${newProofImageUrl} vient de retirer ${new Intl.NumberFormat("fr-FR").format(Number(newProofTestimonial))} FCFA avec succès !`;'
);
fs.writeFileSync('src/pages/Admin.tsx', code);
