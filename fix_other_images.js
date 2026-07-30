import fs from 'fs';

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/pages/Admin.tsx', {
    "/app_icon_orange.jpg?v=2": "https://i.imgur.com/XhQfAmw.png"
});

replaceInFile('src/pages/Invest.tsx', {
    "/app_icon_orange.jpg?v=2": "https://i.imgur.com/XhQfAmw.png"
});

replaceInFile('index.html', {
    "/app_icon_orange.jpg?v=2": "https://i.imgur.com/XhQfAmw.png"
});

console.log('Replaced app_icon_orange.jpg with Imgur link');
