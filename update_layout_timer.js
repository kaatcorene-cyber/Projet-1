import fs from 'fs';

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Replace the single call in useEffect to include a setInterval
content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(user\?.id && !hasCheckedYields.current\) \{\n\s*hasCheckedYields.current = true;\n\s*processDailyYields\(user.id\);\n\s*preloadInvestments\(user.id\);\n\s*\}\n\s*\}, \[user\?.id\]\);/s,
  `useEffect(() => {
    if (user?.id) {
      if (!hasCheckedYields.current) {
        hasCheckedYields.current = true;
        processDailyYields(user.id);
        preloadInvestments(user.id);
      }
      
      const interval = setInterval(() => {
        processDailyYields(user.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);`
);

// In processDailyYields, call refreshUser() if totalToAdd > 0
// Wait, Layout.tsx needs access to refreshUser
content = content.replace(
  /const \{ isAuthenticated, user, logout \} = useAuthStore\(\);/s,
  `const { isAuthenticated, user, logout, refreshUser } = useAuthStore();`
);

content = content.replace(
  /await supabase\.from\('users'\)\.update\(\{ balance: userData\.balance \+ totalToAdd \}\)\.eq\('id', userId\);\n\s*\}/s,
  `await supabase.from('users').update({ balance: userData.balance + totalToAdd }).eq('id', userId);
          }
          refreshUser();`
);

fs.writeFileSync('src/components/Layout.tsx', content);
