import fs from 'fs';
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /const handleUpdateSettings = async \(\) => \{\s*setLoading\(true\);\s*const \{ error \} = await supabase\.from\('settings'\)\.upsert\(\[\s*\{ key: 'payment_link', value: paymentLink \},\s*\{ key: 'group_link', value: groupLink \},\s*\{ key: 'support_link', value: supportLink \}\s*\], \{ onConflict: 'key' \}\);\s*setLoading\(false\);\s*if \(error\) \{\s*setMessage\(\{ type: 'error', text: 'Erreur lors de l\\'enregistrement : ' \+ error\.message \}\);\s*\} else \{\s*setMessage\(\{ type: 'success', text: 'Paramètres enregistrés !' \}\);\s*\}\s*\};/;

content = content.replace(regex, `const handleUpdateSettings = async () => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment enregistrer ces paramètres ?",
      onConfirm: async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('settings').upsert([
            { key: 'payment_link', value: paymentLink },
            { key: 'group_link', value: groupLink },
            { key: 'support_link', value: supportLink }
          ], { onConflict: 'key' });
          if (error) {
            setMessage({ type: 'error', text: "Erreur: " + error.message });
          } else {
            setMessage({ type: 'success', text: 'Paramètres enregistrés !' });
          }
        } finally {
          setLoading(false);
        }
      }
    });
  };`);

fs.writeFileSync('src/pages/Admin.tsx', content);
