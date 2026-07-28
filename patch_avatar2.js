import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const search = `  const [avatar, setAvatar] = useState<string>(() => {
    const saved = localStorage.getItem(\`avatar_\${user?.id}\`);
    if (saved && saved.startsWith('http')) return '/olam_logo_final.png';
    return saved || '/olam_logo_final.png';
  });`;

const replace = `  const [avatar, setAvatar] = useState<string>('/olam_logo_final.png');

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(\`avatar_\${user.id}\`);
      if (saved && !saved.startsWith('http')) {
        setAvatar(saved);
      } else {
        setAvatar('/olam_logo_final.png');
      }
    }
  }, [user?.id]);`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log('patched');
} else {
  console.log('search not found');
}
