const fs = require('fs');
let contentBank = fs.readFileSync('src/pages/Bank.tsx', 'utf8');
contentBank = contentBank.replace(/withdrawal_info_/g, 'withdrawal_info_v2_');
fs.writeFileSync('src/pages/Bank.tsx', contentBank, 'utf8');

let contentWithdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');
contentWithdraw = contentWithdraw.replace(/withdrawal_info_/g, 'withdrawal_info_v2_');
fs.writeFileSync('src/pages/Withdraw.tsx', contentWithdraw, 'utf8');

console.log("Updated local storage key");
