import fs from 'fs';
import path from 'path';

const files = [
    'src/pages/Register.tsx',
    'src/pages/Login.tsx',
    'src/pages/Team.tsx',
    'src/pages/History.tsx',
    'src/pages/Invest.tsx',
    'src/pages/Dashboard.tsx'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if imported at all
    if (content.includes('<Sun ') || content.includes('<Sun>')) {
        if (!content.includes("lucide-react")) {
            content = "import { Sun } from 'lucide-react';\n" + content;
            fs.writeFileSync(file, content);
            console.log('Added missing import to', file);
        } else if (!content.includes('Sun,') && !content.includes(' Sun ')) {
            content = content.replace(/import \{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, group1) => {
                if (!group1.includes('Sun')) {
                    return `import { ${group1.trim()}, Sun } from 'lucide-react';`;
                }
                return match;
            });
            fs.writeFileSync(file, content);
            console.log('Added Sun to existing imports in', file);
        }
    }
});
