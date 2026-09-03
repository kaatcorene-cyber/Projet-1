import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

withdraw = withdraw.replace(
  /  if \(infoLoaded && !withdrawalInfo\) \{[\s\S]*?  return \(/m,
  "  return ("
);

const redirectCode = `
      loadInfo();
    }
  }, [user?.id]);

  useEffect(() => {
    if (infoLoaded && !withdrawalInfo) {
      navigate('/bank');
    }
  }, [infoLoaded, withdrawalInfo, navigate]);
`;

withdraw = withdraw.replace(
  /\s*loadInfo\(\);\n    \}\n  \}, \[user\?\.id\]\);/,
  redirectCode
);

fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
console.log('Fixed withdraw redirect');
