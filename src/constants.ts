export const COUNTRIES = {
  "Côte d'Ivoire": { code: "+225", length: 10, placeholder: "0102030405" },
  "Togo": { code: "+228", length: 8, placeholder: "90000000" },
  "Bénin": { code: "+229", length: 8, placeholder: "01020304" },
  "Burkina": { code: "+226", length: 8, placeholder: "70000000" },
  "Cameroun": { code: "+237", length: 9, placeholder: "600000000" },
  "Niger": { code: "+227", length: 8, placeholder: "90000000" },
  "Tchad": { code: "+235", length: 8, placeholder: "60000000" },
  "Gabon": { code: "+241", length: 9, placeholder: "077000000" },
  "Congo RDC": { code: "+243", length: 9, placeholder: "810000000" },
  "Congo Brazzaville": { code: "+242", length: 9, placeholder: "060000000" },
  "Mali": { code: "+223", length: 8, placeholder: "70000000" },
  "Sénégal": { code: "+221", length: 9, placeholder: "770000000" }
} as const;

export type CountryName = keyof typeof COUNTRIES;

export const COUNTRY_NAMES = Object.keys(COUNTRIES) as CountryName[];
