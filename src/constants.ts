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

export const PAYMENT_METHODS: Record<CountryName, { id: string, name: string }[]> = {
  "Côte d'Ivoire": [
    { id: 'wave', name: 'Wave' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'moov', name: 'Moov Money' }
  ],
  "Togo": [
    { id: 'tmoney', name: 'TMoney' },
    { id: 'flooz', name: 'Flooz (Moov)' }
  ],
  "Bénin": [
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'celtis', name: 'Celtis Pay' }
  ],
  "Burkina": [
    { id: 'orange', name: 'Orange Money' },
    { id: 'moov', name: 'Moov Money' }
  ],
  "Cameroun": [
    { id: 'orange', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' }
  ],
  "Niger": [
    { id: 'airtel', name: 'Airtel Money' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'al_izza', name: 'Al Izza' }
  ],
  "Tchad": [
    { id: 'airtel', name: 'Airtel Money' },
    { id: 'moov', name: 'Moov Money' }
  ],
  "Gabon": [
    { id: 'airtel', name: 'Airtel Money' },
    { id: 'moov', name: 'Moov Money' }
  ],
  "Congo RDC": [
    { id: 'mpesa', name: 'M-Pesa' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'airtel', name: 'Airtel Money' }
  ],
  "Congo Brazzaville": [
    { id: 'mtn', name: 'MTN Mobile Money' },
    { id: 'airtel', name: 'Airtel Money' }
  ],
  "Mali": [
    { id: 'orange', name: 'Orange Money' },
    { id: 'moov', name: 'Moov Money' },
    { id: 'sama', name: 'SAMA Money' }
  ],
  "Sénégal": [
    { id: 'wave', name: 'Wave' },
    { id: 'orange', name: 'Orange Money' },
    { id: 'free', name: 'Free Money' }
  ]
};
