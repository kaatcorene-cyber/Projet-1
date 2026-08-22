import fs from 'fs';
import path from 'path';

const file = 'src/pages/Invest.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Minage réussi/g, 'Contrat activé avec succès');
content = content.replace(/'Mine'/g, "'Projets'");
content = content.replace(/>Mine</g, ">Projets d'entreprise<");
content = content.replace(/Mine de Diamant/g, 'Contrats Premium');
content = content.replace(/Mine d'Or/g, 'Contrats Standards');
content = content.replace(/Gem/g, 'Briefcase');
content = content.replace(/Coins/g, 'Activity');

fs.writeFileSync(file, content);
console.log('Invest updated');

const file2 = 'src/components/BottomNav.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace(/Gem/g, 'Briefcase');
fs.writeFileSync(file2, content2);

