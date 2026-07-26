import fs from 'fs';

function removeTitle(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the flex container that has the logo and the H1 title
    content = content.replace(/<div className="flex items-center justify-center gap-3 mb-2">[\s\S]*?<\/div>\s*<p/m, '<p');
    // For safety if it didn't match
    content = content.replace(/<img src="https:\/\/i.imgur.com\/2QzGpuQ\.png"[\s\S]*?\/>/g, '');
    content = content.replace(/<h1 className="text-2xl grotesk font-black text-slate-900 tracking-tight">(Connexion|Inscription)<\/h1>/g, '');
    
    fs.writeFileSync(filePath, content);
}

removeTitle('src/pages/Login.tsx');
removeTitle('src/pages/Register.tsx');
