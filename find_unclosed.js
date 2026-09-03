import fs from 'fs';
const content = fs.readFileSync('dash_return.tsx', 'utf8');

let depth = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
    let open = (line.match(/<div/g) || []).length;
    let close = (line.match(/<\/div>/g) || []).length;
    depth += open - close;
    console.log(`${String(i + 1).padStart(3, '0')} [${depth}] ${line.substring(0, 80).trim()}`);
});
