import fs from 'fs';

function removeSub(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<div className="text-center mb-8">\s*<p className="text-slate-500 font-medium text-sm">.*?<\/p>\s*<\/div>/, '');
    fs.writeFileSync(filePath, content);
}
removeSub('src/pages/Login.tsx');
removeSub('src/pages/Register.tsx');
