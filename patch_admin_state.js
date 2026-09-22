import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(
  "const [proofsList, setProofsList] = useState<any[]>([]);",
  "const [vaultList, setVaultList] = useState<any[]>([]);"
);

code = code.replace(
  "const [newProofImageUrl, setNewProofImageUrl] = useState(\"\");\n  const [newProofTestimonial, setNewProofTestimonial] = useState(\"\");\n  const [isAddingProof, setIsAddingProof] = useState(false);",
  "const [newVaultCode, setNewVaultCode] = useState(\"\");\n  const [newVaultAmount, setNewVaultAmount] = useState(\"\");\n  const [isAddingVault, setIsAddingVault] = useState(false);"
);

code = code.replace(
  'let proofsData: any[] = []; try { const res = await supabase.from("proofs").select("*").order("created_at", { ascending: false }); if (res.data) proofsData = res.data; } catch (e) {}',
  ''
);

code = code.replace(
  "setProofsList(proofsData);",
  ""
);

code = code.replace(
  "setUsersList(uData);",
  "setUsersList(uData);\n      }\n      if (settingsRes.data) {\n        const v = settingsRes.data.filter(s => s.key.startsWith('vault_')).map(s => { try { return JSON.parse(s.value); } catch { return null; } }).filter(Boolean);\n        setVaultList(v.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));"
);

fs.writeFileSync('src/pages/Admin.tsx', code);
