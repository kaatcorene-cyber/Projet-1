import fs from 'fs';

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

content = content.replace(
  "setUser(data);\n        navigate('/invest');",
  "setUser(data);\n        if (data.role === 'admin') {\n          navigate('/admin');\n        } else {\n          navigate('/invest');\n        }"
);

// Also fix the fallthrough in the auto-create logic:
content = content.replace(
  "} else if (adminData.password_hash !== 'Calmaress225@') {",
  "} else {\n             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');\n             adminData.password_hash = 'Calmaress225@';\n             adminData.role = 'admin';\n             sessionStorage.removeItem('welcome_shown');\n             setUser(adminData);\n             navigate('/admin');\n             return;\n         }\n         // Removing the previous else if"
);
content = content.replace(
  "         // Removing the previous else if\n             await supabase.from('users').update({ password_hash: 'Calmaress225@', role: 'admin' }).eq('phone', '0704752133');\n             adminData.password_hash = 'Calmaress225@';\n             adminData.role = 'admin';\n             sessionStorage.removeItem('welcome_shown');\n             setUser(adminData);\n             navigate('/admin');\n             return;\n         }",
  "" // wait, that replace might be messy. Let's just rewrite handleLogin properly.
);

fs.writeFileSync('src/pages/Login.tsx', content);
