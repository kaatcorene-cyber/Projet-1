const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const searchAdminStr = `    try {
      await supabase.from('users').update({ 
        bank_method: editBankMethod,
        bank_account_name: editBankAccountName,
        bank_account_number: editBankAccountNumber
      }).eq('id', id);
    } catch(e) {}`;

if (content.includes(searchAdminStr)) {
  content = content.replace(searchAdminStr, '');
  fs.writeFileSync('src/pages/Admin.tsx', content, 'utf8');
  console.log("Reverted Admin.tsx");
} else {
  console.log("Not found in Admin.tsx");
}
