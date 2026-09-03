import fs from 'fs';

let content = `export const COUNTRIES = {
  "Côte d'Ivoire": { code: "+225", length: 10, placeholder: "0102030405" }
} as const;

export type CountryName = keyof typeof COUNTRIES;
export const COUNTRY_NAMES = Object.keys(COUNTRIES) as CountryName[];

export const PAYMENT_METHODS: Record<CountryName, { id: string, name: string }[]> = {
  "Côte d'Ivoire": [
    { id: 'wave', name: 'Wave' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'djamo', name: 'Djamo' }
  ]
};
`;

fs.writeFileSync('src/constants.ts', content);
