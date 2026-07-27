import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const oldState = `  const [avatar, setAvatar] = useState<string>(
    localStorage.getItem(\`avatar_\${user?.id}\`) || '/logo.jpg'
  );`;

const newState = `  const [avatar, setAvatar] = useState<string>(() => {
    const saved = localStorage.getItem(\`avatar_\${user?.id}\`);
    if (saved && saved.startsWith('http')) return '/logo.jpg';
    return saved || '/logo.jpg';
  });`;

content = content.replace(oldState, newState);
fs.writeFileSync('src/pages/Dashboard.tsx', content);
