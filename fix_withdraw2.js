import fs from 'fs';
let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

withdraw = withdraw.replace(
  /  if \(infoLoaded && !withdrawalInfo\) \{[\s\S]*?  return \(/m,
  "  return ("
);

withdraw = withdraw.replace(
  /setInfoLoaded\(true\);\n      \};\n      loadInfo\(\);/,
  `setInfoLoaded(true);\n      };\n      loadInfo();\n    }\n  }, [user?.id]);\n\n  useEffect(() => {\n    if (infoLoaded && !withdrawalInfo) {\n      navigate('/bank');\n    }\n  }, [infoLoaded, withdrawalInfo, navigate]);`
);
// wait, the regex replacement for loadInfo might be tricky. Let's do it safely.
