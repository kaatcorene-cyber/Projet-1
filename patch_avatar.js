import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const effectToInsert = `
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(\`avatar_\${user.id}\`);
      if (saved && !saved.startsWith('http')) {
        setAvatar(saved);
      } else {
        setAvatar('/olam_logo_final.png');
      }
    }
  }, [user?.id]);
`;

// Insert the effect after the initial useState for avatar
content = content.replace(
  /const \[avatar, setAvatar\] = useState<string>\(\(\) => \{[^}]+\}\);/m,
  `const [avatar, setAvatar] = useState<string>('/olam_logo_final.png');\n${effectToInsert}`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);

