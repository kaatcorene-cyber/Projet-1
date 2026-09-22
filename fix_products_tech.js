import fs from 'fs';

let code = fs.readFileSync('src/pages/Products.tsx', 'utf8');

// Replace texts
code = code.replace(/Investissez dans l'élevage en Côte d'Ivoire/g, "Investissez dans les technologies de demain.");
code = code.replace(/Votre plateforme dédiée à l'investissement dans le secteur de l'élevage/g, "Votre plateforme dédiée à l'investissement dans le Cloud computing et l'Intelligence Artificielle");
code = code.replace(/Découvrez nos opportunités et participez activement au développement de l'agriculture locale/g, "Financez des fermes de serveurs, déployez des nœuds IA et générez des revenus passifs");
code = code.replace(/Pack Élevage/g, "Serveur Tech");
code = code.replace(/Nos Packs/g, "Nos Serveurs");

// Check if we need to replace the image of the plans like in Home.tsx
const oldImgBlock = /<img referrerPolicy="no-referrer" src=\{plan\.image \|\| "https:\/\/images\.unsplash\.com\/photo-1558494949-ef010cbdcc31\?auto=format&fit=crop&q=80&w=800"\} alt="Plan" className="w-full h-full object-cover" \/>/g;
const newImgBlock = `<img referrerPolicy="no-referrer" src={plan.image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"} alt="Plan" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />`;

code = code.replace(oldImgBlock, newImgBlock);

// Replace "Pack" with "Nœud/Serveur" in error messages or headings if needed
code = code.replace(/Ce pack est/g, "Ce serveur est");
code = code.replace(/payer ce pack/g, "financer ce serveur");

fs.writeFileSync('src/pages/Products.tsx', code);
