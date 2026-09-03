import fs from 'fs';
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

const regex = /const \{ error: txError \} = await supabase\.from\('transactions'\)\.insert\(\[\{([\s\S]*?)window\.location\.href = finalUrl;/m;

const replacement = `const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: \`NAFOLO - \${user.phone}\`,
        status: 'approved' // Validation automatique
      }]);
      if (txError) throw txError;
      
      const newBalance = (user.balance || 0) + Number(amount);
      await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
      
      const finalUrl = \`https://pay.nafolo.co/?mode=linkpay&client=cbyama&amount=\${amount}\`;
      window.location.href = finalUrl;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Deposit.tsx', code);
