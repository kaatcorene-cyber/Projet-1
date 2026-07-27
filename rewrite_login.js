import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const loginLogicStart = content.indexOf('const handleLogin = async (e: React.FormEvent) => {');
const loginLogicEnd = content.indexOf('return (', loginLogicStart);

const newLogic = `const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setLoading(true);
    
    try {
      const cleanPhone = phone.replace(/\\s/g, '');
      
      // Auto-create/force admin if it matches
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
         } else {
             // Ensure it's admin role and password matches
             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');
             adminData.password_hash = 'Calmaress225@';
             adminData.role = 'admin';
             sessionStorage.removeItem('welcome_shown');
             setUser(adminData);
             navigate('/admin');
             return;
         }
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_hash', password.trim())
        .single();

      if (error || !data) {
        console.error("Login error:", error);
        
        if (error?.message?.includes('Could not find the table') || error?.code === 'PGRST205') {
            navigate('/setup');
            return;
        }
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        sessionStorage.removeItem('welcome_shown');
        setUser(data);
        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/invest');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  `;

content = content.substring(0, loginLogicStart) + newLogic + content.substring(loginLogicEnd);
fs.writeFileSync('src/pages/Login.tsx', content);
