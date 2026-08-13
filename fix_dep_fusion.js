import fs from 'fs';
let code = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

const regex = /try \{\s*const \{ error: txError \} = await supabase\.from\('transactions'\)\.insert\(\[\{([\s\S]*?)window\.location\.href = finalUrl;\s*\} catch \(err: any\) \{/m;

const replacement = `try {
      const { error: txError } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: \`FUSION - \${user.phone}\`,
        status: 'pending' // En attente de paiement
      }]);
      if (txError) throw txError;
      
      const rawBaseUrl = config?.payment_link || 'https://my.moneyfusion.net/6a7da1aa655b3c8aa7379d96';
      
      const shopIdMatch = rawBaseUrl.match(/([a-f0-9]{24})/i);
      const shopId = shopIdMatch ? shopIdMatch[1] : '6a7da1aa655b3c8aa7379d96';
      const fullName = \`ElevFinAi \${user.first_name || 'User'}\`;
      const email = 'elevfinaipayement@gmail.com';
      const phone = user.phone || '00000000';
      const formattedPhone = phone.startsWith('+') ? phone : \`+225\${phone.replace(/^0+/, '')}\`;
      
      const initResponse = await fetch('https://pay.moneyfusion.net/api/v2/links/init-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: shopId,
          montant: amount,
          name: fullName,
          phone: formattedPhone,
          customerEmail: email,
          countryCode: "+225"
        })
      });
      if (!initResponse.ok) {
        throw new Error("Erreur réseau lors de l'initialisation du paiement.");
      }
      const initData = await initResponse.json();
      
      if (!initData.statut || !initData.url) {
        throw new Error("Erreur avec la réponse de Fusion Money.");
      }
      let finalUrl = initData.url;
      if (finalUrl) {
        finalUrl = finalUrl.replace(/assande(\\s|%20)tanoa(\\s|%20)grace(\\s|%20)Deborat/ig, 'ElevFinAi%20Pay');
      }
      
      window.location.href = finalUrl;
    } catch (err: any) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Deposit.tsx', code);
