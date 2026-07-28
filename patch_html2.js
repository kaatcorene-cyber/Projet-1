import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');
const headEnd = '</head>';
const preload = `    <link rel="preload" as="image" href="https://i.imgur.com/tCl7xi9l.jpg">
    <link rel="preload" as="image" href="https://i.imgur.com/I2qt7oHl.jpg">
    <link rel="preload" as="image" href="/logo_olam.png">
`;
html = html.replace(headEnd, preload + headEnd);
fs.writeFileSync('index.html', html);
