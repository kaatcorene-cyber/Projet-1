import fs from 'fs';

const COUNTRIES = [
  { name: "Cote d'Ivoire", code: "+225" },
  { name: "Togo", code: "+228" },
  { name: "Burkina Faso", code: "+226" }
];

// ----- Login.tsx -----
let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Replace state
loginCode = loginCode.replace(
  /const \[country\] = useState\("Cote d'Ivoire"\);/,
  `const [country, setCountry] = useState("Cote d'Ivoire");`
);

// Add country select before phone
const loginPhoneInputStr = `<div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-white/20 pr-3">+225</span>`;

const loginCountrySelect = `<div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium appearance-none"
              required
            >
              <option value="Cote d'Ivoire">Côte d'Ivoire (+225)</option>
              <option value="Togo">Togo (+228)</option>
              <option value="Burkina Faso">Burkina Faso (+226)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3">
                {country === "Cote d'Ivoire" ? '+225' : country === 'Togo' ? '+228' : '+226'}
              </span>`;

loginCode = loginCode.replace(loginPhoneInputStr, loginCountrySelect);
loginCode = loginCode.replace(/onChange=\{\(e\) => setPhone\(e\.target\.value\.replace\(\/^\+225\/, ''\)\)\}/, 
  `onChange={(e) => setPhone(e.target.value.replace(/^\\+\\d+/, ''))}`); 

fs.writeFileSync('src/pages/Login.tsx', loginCode);

// ----- Register.tsx -----
let regCode = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const regPhoneInputStr = `<div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-white/20 pr-3">+225</span>`;

const regCountrySelect = `<div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Pays</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-medium appearance-none"
              required
            >
              <option value="Cote d'Ivoire">Côte d'Ivoire (+225)</option>
              <option value="Togo">Togo (+228)</option>
              <option value="Burkina Faso">Burkina Faso (+226)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Téléphone</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3">
                {formData.country === "Cote d'Ivoire" ? '+225' : formData.country === 'Togo' ? '+228' : '+226'}
              </span>`;

regCode = regCode.replace(regPhoneInputStr, regCountrySelect);
regCode = regCode.replace(/onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, phone: e\.target\.value\.replace\(\/^\+225\/, ''\) \}\)\}/, 
  `onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/^\\+\\d+/, '') })}`); 

fs.writeFileSync('src/pages/Register.tsx', regCode);
