import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
files.push('index.html');
files.forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css') || f.endsWith('.html') || f.endsWith('.json')) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Revert texts
        content = content.replace(/Nova Platform/g, 'Adela Mining');
        content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1614680376573-3e4e1ef4142a\?w=128&h=128&fit=crop&q=80/g, 'https://i.imgur.com/bjYgoI6.png');
        content = content.replace(/Découvrez nos solutions de rentabilité et faites fructifier votre capital\./g, '𝑨𝒄𝒉𝒆𝒕𝒆𝒛 𝒖𝒏𝒆 𝒎𝒊𝒏𝒆 𝒅’𝒐𝒓 𝒐𝒖 𝒅𝒆 𝒅𝒊𝒂𝒎𝒂𝒏𝒕 𝒆𝒕 𝒇𝒂𝒊𝒕𝒆𝒔 𝒇𝒓𝒖𝒄𝒕𝒊𝒇𝒊𝒆𝒓 𝒗𝒐𝒕𝒓𝒆 𝒄𝒂𝒑𝒊𝒕𝒂𝒍.');
        content = content.replace(/Contrat activé avec succès/g, 'Minage réussi');
        content = content.replace(/'Projets'/g, "'Mine'");
        content = content.replace(/>Projets d'entreprise</g, ">Mine<");
        content = content.replace(/Contrats Premium/g, 'Mine de Diamant');
        content = content.replace(/Contrats Standards/g, "Mine d'Or");

        // Change colors from indigo/purple to emerald globally for the basic stuff
        content = content.replace(/indigo/g, 'emerald');
        
        // Revert icons in BottomNav
        if (f.includes('BottomNav.tsx')) {
            content = content.replace(/BriefcaseBusiness/g, 'Gem');
            content = content.replace(/Projets/g, 'Mine'); // Just in case
        }
        if (f.includes('Invest.tsx')) {
            content = content.replace(/Briefcase/g, 'Gem');
            content = content.replace(/Activity/g, 'Coins');
        }

        fs.writeFileSync(f, content);
    }
});
