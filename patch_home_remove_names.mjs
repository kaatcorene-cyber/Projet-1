import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
content = content.replace(
  /Votre plateforme dédiée à l'investissement dans le secteur de l'élevage en Côte d'Ivoire\. Découvrez nos différentes opportunités \(Aviculture, Pisciculture, etc\.\) et participez activement au développement de l'agriculture locale tout en générant des revenus passifs sécurisés\./g,
  "Votre plateforme dédiée à l'investissement. Découvrez nos différentes opportunités et générez des revenus passifs sécurisés."
);
fs.writeFileSync('src/pages/Home.tsx', content);
