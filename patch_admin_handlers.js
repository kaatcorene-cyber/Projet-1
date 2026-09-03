import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldHandlers = `  const handleAddProof = async (e: any) => {
    e.preventDefault();
    if (!newProofImageUrl || !newProofTestimonial) return;
    setIsAddingProof(true);
    try {
      const text = \`\${newProofImageUrl} vient de retirer \${new Intl.NumberFormat("fr-FR").format(Number(newProofTestimonial))} FCFA avec succès !\`;
      await supabase.from('proofs').insert({
        image_url: 'text_only',
        testimonial: text
      });
      setNewProofImageUrl("");
      setNewProofTestimonial("");
      fetchData(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingProof(false);
    }
  };

  const handleDeleteProof = async (id: string) => {
    if (!window.confirm("Supprimer cette preuve ?")) return;
    try {
      await supabase.from('proofs').delete().eq('id', id);
      fetchData(false);
    } catch(err) {
      console.error(err);
    }
  };`;

const newHandlers = `  const handleAddVault = async (e: any) => {
    e.preventDefault();
    if (!newVaultCode || !newVaultAmount) return;
    setIsAddingVault(true);
    try {
      const code = newVaultCode.trim().toUpperCase();
      const amount = Number(newVaultAmount);
      
      const vaultData = {
        code,
        total_amount: amount,
        remaining_amount: amount,
        created_at: new Date().toISOString(),
        claimed_by: []
      };
      
      await supabase.from('settings').upsert({
        key: 'vault_' + code,
        value: JSON.stringify(vaultData)
      });
      
      setNewVaultCode("");
      setNewVaultAmount("");
      fetchData(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingVault(false);
    }
  };

  const handleDeleteVault = async (code: string) => {
    if (!window.confirm("Supprimer ce coffre ?")) return;
    try {
      await supabase.from('settings').delete().eq('key', 'vault_' + code);
      fetchData(false);
    } catch(err) {
      console.error(err);
    }
  };`;

code = code.replace(oldHandlers, newHandlers);

fs.writeFileSync('src/pages/Admin.tsx', code);
