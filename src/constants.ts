export const COUNTRIES = {
  "Côte d'Ivoire": { code: "+225", length: 10, placeholder: "0102030405" },
  "Cameroun": { code: "+237", length: 9, placeholder: "600000000" },
  "Niger": { code: "+227", length: 8, placeholder: "90000000" },
} as const;

export type CountryName = keyof typeof COUNTRIES;

export const COUNTRY_NAMES = Object.keys(COUNTRIES) as CountryName[];

export const PAYMENT_METHODS: Record<CountryName, { id: string, name: string }[]> = {
  "Côte d'Ivoire": [
    { id: 'wave', name: 'Wave' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'moov', name: 'Moov Money' }
  ],
  "Cameroun": [
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' }
  ],
  "Niger": [
    { id: 'amana', name: 'Amana' },
    { id: 'nita', name: 'Nita' },
    { id: 'airtel', name: 'Airtel Money' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'zamanicash', name: 'Zamanicash' }
  ]
};
