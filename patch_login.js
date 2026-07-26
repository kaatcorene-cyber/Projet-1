import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(/const { data, error } = await supabase\s*\n\s*\.from\('users'\)\s*\n\s*\.select\('\*'\)\s*\n\s*\.eq\('phone', phone\)/, 
`const cleanPhone = phone.replace(/\\s/g, '');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)`);

fs.writeFileSync('src/pages/Login.tsx', content);
