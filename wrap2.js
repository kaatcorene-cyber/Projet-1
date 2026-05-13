import fs from 'fs';
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const strStart = "const handleUpdateSettings = async () => {";
const strEnd = "  };\n\n  if (isInitializing)";

let start = content.indexOf(strStart);
let end = content.indexOf(strEnd);
if (start !== -1 && end !== -1) {
    let block = content.substring(start, end);
    let newBlock = `const handleUpdateSettings = async () => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment enregistrer ces paramètres ?",
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('settings').upsert([
          { key: 'payment_link', value: paymentLink },
          { key: 'group_link', value: groupLink },
          { key: 'support_link', value: supportLink }
        ], { onConflict: 'key' });
        setLoading(false);
        
        if (error) {
          setMessage({ type: 'error', text: 'Erreur lors de l\\'enregistrement : ' + error.message });
        } else {
          useAppStore.getState().setSettingsCache(null as any);
          setMessage({ type: 'success', text: 'Paramètres enregistrés !' });
        }
      }
    });
`;
    content = content.replace(block, newBlock);
}

const planStart = `const handleRemovePlan = (index: number) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    handleSavePlans(updatedPlans);
  };`;
const planEnd = `const handleRemovePlan = (index: number) => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment supprimer ce plan ?",
      onConfirm: async () => {
        const updatedPlans = plans.filter((_, i) => i !== index);
        handleSavePlans(updatedPlans);
      }
    });
  };`;

content = content.replace(planStart, planEnd);

fs.writeFileSync('src/pages/Admin.tsx', content);
