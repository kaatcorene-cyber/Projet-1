import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(/const \[phone, setPseudo\] = useState\(''\);/, "const [phone, setPhone] = useState('');");

fs.writeFileSync('src/pages/Login.tsx', content);
