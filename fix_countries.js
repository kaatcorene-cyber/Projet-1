import fs from 'fs';

// 1. Update src/constants.ts to only have the 6 countries if needed, OR just keep them and we filter in Login/Register.
// Actually, let's just rewrite the countries list in Login.tsx and Register.tsx to only show those 6, 
// and update constants.ts payment methods if needed. But constants.ts already has good payment methods for them.
// "Burkina" -> Burkina Faso.

let login = fs.readFileSync('src/pages/Login.tsx', 'utf8');
let register = fs.readFileSync('src/pages/Register.tsx', 'utf8');

const ALLOWED_COUNTRIES = ["Côte d'Ivoire", "Togo", "Bénin", "Burkina", "Cameroun", "Niger"];

const loginSelectRegex = /<select[\s\S]*?<\/select>/;

const getSelectReplacement = (stateVar, setVar) => `<select
                  value={${stateVar}}
                  onChange={(e) => ${setVar}(e.target.value)}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Burkina">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                  <option value="Cameroun">Cameroun</option>
                </select>`;

login = login.replace(loginSelectRegex, getSelectReplacement('country', 'setCountry'));
register = register.replace(/<select[\s\S]*?<\/select>/, `<select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-[120px] shrink-0 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-bold text-sm"
                >
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Burkina">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                  <option value="Cameroun">Cameroun</option>
                </select>`);

// Fix the phone code span
const codeLogic = `{country === 'Bénin' ? '+229' : country === 'Togo' ? '+228' : country === 'Burkina' ? '+226' : country === 'Niger' ? '+227' : country === 'Cameroun' ? '+237' : '+225'}`;
const codeLogicRegister = `{formData.country === 'Bénin' ? '+229' : formData.country === 'Togo' ? '+228' : formData.country === 'Burkina' ? '+226' : formData.country === 'Niger' ? '+227' : formData.country === 'Cameroun' ? '+237' : '+225'}`;

login = login.replace(/\{country === 'Bénin'[^}]+\}/, codeLogic);
register = register.replace(/\{formData\.country === 'Bénin'[^}]+\}/, codeLogicRegister);

fs.writeFileSync('src/pages/Login.tsx', login);
fs.writeFileSync('src/pages/Register.tsx', register);
console.log("Updated Login and Register");
