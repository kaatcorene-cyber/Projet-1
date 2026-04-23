export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  methods: string[];
}

export const COUNTRIES: Country[] = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', methods: ['MTN Mobile Money', 'Moov Money'] },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', methods: ['Orange Money', 'Moov Money'] },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', methods: ['Orange Money', 'MTN Mobile Money'] },
  { code: 'CG', name: 'Congo Brazzaville', dialCode: '+242', flag: '🇨🇬', methods: ['MTN Mobile Money', 'Airtel Money'] },
  { code: 'CD', name: 'Congo RDC', dialCode: '+243', flag: '🇨🇩', methods: ['M-Pesa', 'Orange Money', 'Airtel Money'] },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', methods: ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money'] },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', methods: ['Orange Money', 'Moov Money'] },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', methods: ['Orange Money', 'Wave', 'Free Money'] },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', methods: ['Tmoney', 'Moov Money'] }
];

export const getCountryByCode = (code: string) => {
  // Backward compatibility: old DB records have full name
  if (code === "Cote d'Ivoire" || code === "Côte d'Ivoire") return COUNTRIES.find(c => c.code === 'CI')!;
  return COUNTRIES.find(c => c.code === code) || COUNTRIES.find(c => c.code === 'CI')!;
};
