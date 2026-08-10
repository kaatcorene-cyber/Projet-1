const fs = require('fs');

function revertBank() {
  let content = fs.readFileSync('src/pages/Bank.tsx', 'utf8');
  
  // Replace the read part
  const searchReadStr = `const { data: userData } = await supabase.from('users').select('bank_method, bank_account_number, bank_account_name').eq('id', user.id).single();
        if (userData && userData.bank_account_number) {
            setPaymentMethod(userData.bank_method || availableMethods[0].id);
            setAccountNumber(userData.bank_account_number || '');
            setAccountHolder(userData.bank_account_name || '');
            setIsSaved(true);
            localStorage.setItem('withdrawal_info_' + user.id, JSON.stringify({
              paymentMethod: userData.bank_method,
              accountNumber: userData.bank_account_number,
              accountHolder: userData.bank_account_name
            }));
            return;
        }`;
  
  if (content.includes(searchReadStr)) {
    content = content.replace(searchReadStr, '');
  }
  
  // Replace the write part
  const searchWriteStr = `await supabase.from('users').update({
        bank_method: paymentMethod,
        bank_account_number: accountNumber,
        bank_account_name: accountHolder
      }).eq('id', user.id);
      
      // Also try to save to settings just in case`;
      
  if (content.includes(searchWriteStr)) {
    content = content.replace(searchWriteStr, '');
  }
  
  fs.writeFileSync('src/pages/Bank.tsx', content, 'utf8');
}

function revertWithdraw() {
  let content = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');
  
  const searchReadStr = `if (!hasLocalData) {
          const { data: userData } = await supabase.from('users').select('bank_method, bank_account_number, bank_account_name').eq('id', user.id).single();
          if (userData && userData.bank_account_number) {
            setWithdrawalInfo({
              paymentMethod: userData.bank_method || 'orange',
              accountNumber: userData.bank_account_number,
              accountHolder: userData.bank_account_name || user.first_name || ''
            });
            hasLocalData = true; // Mark as loaded
          } else {
            // Fallback to settings
            const { data } = await supabase.from('settings').select('value').eq('key', \`bank_\${user.id}\`).maybeSingle();`;
            
  const replaceReadStr = `if (!hasLocalData) {
          const { data } = await supabase.from('settings').select('value').eq('key', \`bank_\${user.id}\`).maybeSingle();`;
          
  if (content.includes(searchReadStr)) {
    content = content.replace(searchReadStr, replaceReadStr);
  }
  
  // and close brace
  const searchBraceStr = `              } catch(e) {}
            }
          }
        }`;
  const replaceBraceStr = `              } catch(e) {}
            }
        }`;
        
  if (content.includes(searchBraceStr)) {
    content = content.replace(searchBraceStr, replaceBraceStr);
  }
  
  fs.writeFileSync('src/pages/Withdraw.tsx', content, 'utf8');
}

revertBank();
revertWithdraw();
console.log("Reverted DB patches");
