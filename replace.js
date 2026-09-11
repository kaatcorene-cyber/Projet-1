import fs from 'fs';
import path from 'path';

function walkPath(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === 'dist' || file === '.git') return;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkPath(fullPath));
        } else {
            if(fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walkPath('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // colors
    content = content.replace(/-red-/g, '-amber-');
    content = content.replace(/bg-red/g, 'bg-amber');
    content = content.replace(/text-red/g, 'text-amber');
    content = content.replace(/border-red/g, 'border-amber');
    content = content.replace(/from-red/g, 'from-amber');
    content = content.replace(/to-red/g, 'to-amber');
    content = content.replace(/ring-red/g, 'ring-amber');
    content = content.replace(/fill-red/g, 'fill-amber');
    
    // Names
    content = content.replace(/Qualcomm/g, 'Sunpower');
    content = content.replace(/QUALCOMM/g, 'SUNPOWER');
    content = content.replace(/qualcomm/g, 'sunpower');

    // Logo image replacements
    const logoRegex = /<img src="https:\/\/i\.imgur\.com\/awFyFRj\.png" alt="SUNPOWER"[^>]*>/g;
    content = content.replace(logoRegex, '<div className="flex items-center gap-1.5"><Sun className="w-6 h-6 text-amber-500" /><span className="font-extrabold text-gray-900 tracking-tighter text-xl">SUN<span className="text-amber-500">POWER</span></span></div>');

    if (original !== content) {
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
