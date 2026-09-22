import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /bank_account_name: editBankName,/g,
  "bank_account_name: editBankAccountName,"
);

admin = admin.replace(
  /bank_account_number: editBankNumber/g,
  "bank_account_number: editBankAccountNumber"
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed bank vars');
