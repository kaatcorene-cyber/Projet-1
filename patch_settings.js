import fs from 'fs';

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Add new state variables
adminContent = adminContent.replace(
  /const \[paymentLink, setPaymentLink\] = useState\(''\);/,
  `const [paymentLink, setPaymentLink] = useState('');
  const [ussdTogo, setUssdTogo] = useState('*155*1*2*1*3*2250140814162#');
  const [ussdCI, setUssdCI] = useState('*155*1*1*0140814162#');
  const [ussdBF, setUssdBF] = useState('*555*1*2*1*1*2250140814162#');
  const [waveNumber, setWaveNumber] = useState('0574738155');`
);

// Fetch initial values
const loadSettingsCode = `
        const sup = settingsRes.data.find(s => s.key === 'support_link');
        const ut = settingsRes.data.find(s => s.key === 'ussd_togo');
        const uc = settingsRes.data.find(s => s.key === 'ussd_ci');
        const ub = settingsRes.data.find(s => s.key === 'ussd_bf');
        const wn = settingsRes.data.find(s => s.key === 'wave_number');
        if (link) setPaymentLink(link.value);
        if (grp) setGroupLink(grp.value);
        if (sup) setSupportLink(sup.value);
        if (ut) setUssdTogo(ut.value);
        if (uc) setUssdCI(uc.value);
        if (ub) setUssdBF(ub.value);
        if (wn) setWaveNumber(wn.value);
        const dbPlansStr = settingsRes.data.find(s => s.key === 'investment_plans');
`;

adminContent = adminContent.replace(
  /const sup = settingsRes\.data\.find\(s => s\.key === 'support_link'\);\s*if \(link\) setPaymentLink\(link\.value\);\s*if \(grp\) setGroupLink\(grp\.value\);\s*if \(sup\) setSupportLink\(sup\.value\);\s*const dbPlansStr = settingsRes\.data\.find\(s => s\.key === 'investment_plans'\);/,
  loadSettingsCode
);

// Save settings
const saveSettingsCode = `{ key: 'payment_link', value: paymentLink },
      { key: 'group_link', value: groupLink },
      { key: 'support_link', value: supportLink },
      { key: 'ussd_togo', value: ussdTogo },
      { key: 'ussd_ci', value: ussdCI },
      { key: 'ussd_bf', value: ussdBF },
      { key: 'wave_number', value: waveNumber }`;

adminContent = adminContent.replace(
  /\{ key: 'payment_link', value: paymentLink \},\s*\{ key: 'group_link', value: groupLink \},\s*\{ key: 'support_link', value: supportLink \}/,
  saveSettingsCode
);


// UI
const uiExtension = `<div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Code USSD Togo (Moov)</label>
                <input
                  type="text"
                  value={ussdTogo}
                  onChange={(e) => setUssdTogo(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-red-500 transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Code USSD Côte d'Ivoire (Moov)</label>
                <input
                  type="text"
                  value={ussdCI}
                  onChange={(e) => setUssdCI(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-red-500 transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Code USSD Burkina Faso (Moov)</label>
                <input
                  type="text"
                  value={ussdBF}
                  onChange={(e) => setUssdBF(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-red-500 transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Numéro de paiement Wave</label>
                <input
                  type="text"
                  value={waveNumber}
                  onChange={(e) => setWaveNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-red-500 transition-colors text-sm font-mono tracking-widest"
                />
              </div>

              <button `;

adminContent = adminContent.replace(/<button \n\s*onClick=\{handleUpdateSettings\}/, uiExtension + "\n                onClick={handleUpdateSettings}");

fs.writeFileSync('src/pages/Admin.tsx', adminContent);

// Add fetch to Deposit.tsx as well

let depositContent = fs.readFileSync('src/pages/Deposit.tsx', 'utf8');

depositContent = depositContent.replace(/export function Deposit\(\) \{/, 
  `export function Deposit() {
  const [ussdCodes, setUssdCodes] = useState({ togo: '*155*1*2*1*3*2250140814162#', ci: '*155*1*1*0140814162#', bf: '*555*1*2*1*1*2250140814162#' });
  const [waveNum, setWaveNum] = useState('0574738155');

  useEffect(() => {
    supabase.from('settings').select('key, value').in('key', ['ussd_togo', 'ussd_ci', 'ussd_bf', 'wave_number']).then(({ data }) => {
      if (data) {
        setUssdCodes(prev => ({
          togo: data.find(s => s.key === 'ussd_togo')?.value || prev.togo,
          ci: data.find(s => s.key === 'ussd_ci')?.value || prev.ci,
          bf: data.find(s => s.key === 'ussd_bf')?.value || prev.bf,
        }));
        setWaveNum(data.find(s => s.key === 'wave_number')?.value || '0574738155');
      }
    });
  }, []);
`);

depositContent = depositContent.replace(
  /if \(country === 'Togo'\) ussd = '\*155\*1\*2\*1\*3\*2250140814162#';\s*else if \(country === "Cote d'Ivoire"\) ussd = '\*155\*1\*1\*0140814162#';\s*else if \(country === 'Burkina Faso'\) ussd = '\*555\*1\*2\*1\*1\*2250140814162#';/g,
  `if (country === 'Togo') ussd = ussdCodes.togo;
        else if (country === "Cote d'Ivoire") ussd = ussdCodes.ci;
        else if (country === 'Burkina Faso') ussd = ussdCodes.bf;`
);

depositContent = depositContent.replace(
  /navigator\.clipboard\.writeText\("0574738155"\);/,
  `navigator.clipboard.writeText(waveNum.replace(/\\s/g, ''));`
);

depositContent = depositContent.replace(/<p className="text-xl font-black text-gray-900 tracking-widest leading-none">0574738155<\/p>/, 
  `<p className="text-xl font-black text-gray-900 tracking-widest leading-none">{waveNum}</p>`);

fs.writeFileSync('src/pages/Deposit.tsx', depositContent);
