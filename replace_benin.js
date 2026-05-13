import fs from 'fs';

const files = ['src/pages/Setup.tsx', 'supabase-schema.sql'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'Benin'/g, `"Cote d'Ivoire"`);
    fs.writeFileSync(file, content);
  }
});
