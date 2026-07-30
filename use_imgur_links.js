import fs from 'fs';

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/Dashboard.tsx', {
    '/avatar_orange_v2.jpg': 'https://i.imgur.com/XhQfAmw.png',
    '/olam_logo_final_v2.png': 'https://i.imgur.com/XhQfAmw.png',
    '/olam_logo_final.png': 'https://i.imgur.com/XhQfAmw.png'
});

replaceInFile('src/components/FloatingSupport.tsx', {
    '/support_avatar_v2.jpg': 'https://i.imgur.com/OZljpLJ.jpg'
});

console.log('Replaced local image paths with direct Imgur links');
