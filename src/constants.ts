export const COUNTRIES = {
  "Côte d'Ivoire": { code: "+225", length: 10, placeholder: "0102030405" },
  "Cameroun": { code: "+237", length: 9, placeholder: "650000000" },
  "Niger": { code: "+227", length: 8, placeholder: "90000000" },
  "Mali": { code: "+223", length: 8, placeholder: "70000000" }
} as const;

export type CountryName = keyof typeof COUNTRIES;

export const COUNTRY_NAMES = Object.keys(COUNTRIES) as CountryName[];
