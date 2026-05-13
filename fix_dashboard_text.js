import fs from 'fs';
const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("l’investissement dans l’énergie SIM.COM", "l’investissement dans l'économie numérique");
content = content.replace("des énergies renouvelables.", "des réseaux de télécommunications.");
content = content.replace("un avenir énergétique plus durable.", "un avenir plus connecté.");
content = content.replace("l’énergie SIM.COM.", "l'économie numérique.");
content = content.replace("panneaux SIM.COMs", "infrastructures SIM");
content = content.replace("l’électricité", "la data");
content = content.replace("réseaux énergétiques", "réseaux de télécommunications");
content = content.replace("La production d’énergie renouvelable", "La gestion de trafic data");
content = content.replace("La vente d’électricité", "La revente d'accès connectés");
content = content.replace("Des partenariats énergétiques", "Des partenariats technologiques");
content = content.replace("Investissez dans l’énergie,", "Investissez dans la data,");
content = content.replace("à une énergie propre,", "à une connectivité forte,");
content = content.replace("indépendance énergétique", "indépendance financière");

fs.writeFileSync(file, content);
console.log('Fixed Dashboard');
