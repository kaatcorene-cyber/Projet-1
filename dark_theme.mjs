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
files.forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Backgrounds & Borders
        content = content.replace(/bg-white/g, 'bg-zinc-900 border-zinc-800/80 shadow-black/20');
        content = content.replace(/bg-gray-50/g, 'bg-zinc-800/50');
        content = content.replace(/bg-gray-100/g, 'bg-zinc-800');
        content = content.replace(/bg-gray-200/g, 'bg-zinc-700');
        
        // Borders
        content = content.replace(/border-gray-100/g, 'border-zinc-800');
        content = content.replace(/border-gray-200/g, 'border-zinc-800');
        content = content.replace(/border-emerald-100/g, 'border-emerald-500/20');
        content = content.replace(/border-emerald-200/g, 'border-emerald-500/30');

        // Texts
        content = content.replace(/text-gray-900/g, 'text-zinc-50');
        content = content.replace(/text-gray-800/g, 'text-zinc-200');
        content = content.replace(/text-gray-700/g, 'text-zinc-300');
        content = content.replace(/text-gray-600/g, 'text-zinc-400');
        content = content.replace(/text-gray-500/g, 'text-zinc-400');
        content = content.replace(/text-gray-400/g, 'text-zinc-500');

        // Specific fix for backgrounds
        content = content.replace(/bg-emerald-50/g, 'bg-emerald-500/10');
        content = content.replace(/bg-emerald-100/g, 'bg-emerald-500/20');

        fs.writeFileSync(f, content);
    }
});
