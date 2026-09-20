export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  methods: string[];
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    dialCode: '+225',
    flag: '🇨🇮',
    methods: ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money']
  },
  {
    code: 'TG',
    name: 'Togo',
    dialCode: '+228',
    flag: '🇹🇬',
    methods: ['Tmoney', 'Moov Money']
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    dialCode: '+226',
    flag: '🇧🇫',
    methods: ['Orange Money', 'Moov Money']
  },
  {
    code: 'BJ',
    name: 'Bénin',
    dialCode: '+229',
    flag: '🇧🇯',
    methods: ['MTN Money', 'Moov Money', 'Celtiis']
  },
  {
    code: 'NE',
    name: 'Niger',
    dialCode: '+227',
    flag: '🇳🇪',
    methods: ['Moov Money', 'My Nita', 'Amana', 'Airtel Money', 'Zamanicash']
  }
];

export function getCountryByCode(code: string): CountryConfig {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
}

export function getCountryByDialCode(dialCode: string): CountryConfig {
  return COUNTRIES.find(c => c.dialCode === dialCode) || COUNTRIES[0];
}
