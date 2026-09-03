import fs from 'fs';

let withdraw = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

withdraw = withdraw.replace(
  /  return \(\n    <div className="min-h-screen/,
  `  if (!infoLoaded || !withdrawalInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen`
);

fs.writeFileSync('src/pages/Withdraw.tsx', withdraw);
console.log('Added loading state to Withdraw');
