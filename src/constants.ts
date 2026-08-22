export const COUNTRIES = {
  "Côte d'Ivoire": { code: "+225", length: 10, placeholder: "0102030405" }
} as const;

export type CountryName = keyof typeof COUNTRIES;

export const COUNTRY_NAMES = Object.keys(COUNTRIES) as CountryName[];
