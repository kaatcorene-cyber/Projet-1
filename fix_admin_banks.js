import fs from 'fs';

let admin = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

admin = admin.replace(
  /return \{ \.\.\.u, bank_method: parsed\.bank_method, bank_account_name: parsed\.bank_account_name \};/g,
  "return { ...u, bank_method: parsed.bank_method, bank_account_name: parsed.bank_account_name, bank_account_number: parsed.bank_account_number };"
);

admin = admin.replace(
  /const bAccountNameRaw = \(u as any\)\?\.bank_account_name \|\| '';\n\s*const bAccountName = bAccountNameRaw\.split\('\|\|\|'\)\[0\] \|\| '';\n\s*const bAccountNumber = bAccountNameRaw\.split\('\|\|\|'\)\[1\] \|\| '';/g,
  `const bAccountName = (u as any)?.bank_account_name || '';\n              const bAccountNumber = (u as any)?.bank_account_number || '';`
);

// We should also fix the handleUpdateBank logic
admin = admin.replace(
  /const packedName = `\$\{editBankName\}\|\|\|\$\{editBankNumber\}`;/g,
  "const packedName = editBankName;"
);

admin = admin.replace(
  /bank_method: editBankMethod,\n\s*bank_account_name: packedName/g,
  "bank_method: editBankMethod,\n        bank_account_name: editBankName,\n        bank_account_number: editBankNumber"
);

admin = admin.replace(
  /value: JSON\.stringify\(\{ bank_method: editBankMethod, bank_account_name: packedName \}\)/g,
  "value: JSON.stringify({ bank_method: editBankMethod, bank_account_name: editBankName, bank_account_number: editBankNumber })"
);

fs.writeFileSync('src/pages/Admin.tsx', admin);
console.log('Fixed banks logic in Admin');
