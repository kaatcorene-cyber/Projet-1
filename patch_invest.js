import fs from 'fs';

let content = fs.readFileSync('src/pages/Invest.tsx', 'utf8');

// Replace the marquee text
content = content.replace(
  "Bienvenue sur OlamAgri, votre partenaire de confiance.",
  "Bienvenue sur Olam Agri, leader de l'investissement agricole."
);
content = content.replace(
  "Nous vous proposons des contrats d'investissement sécurisés à haut rendement pour générer des revenus stables et performants au quotidien.",
  "Sécurisez votre avenir avec nos contrats à haut rendement, garantis, professionnels et transparents."
);

// Remove the TrendingUp icon in Quota
content = content.replace(
  '<TrendingUp className="w-3 h-3" />',
  ''
);

fs.writeFileSync('src/pages/Invest.tsx', content);
