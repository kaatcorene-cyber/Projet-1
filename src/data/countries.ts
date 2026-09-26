export interface CountryConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneLength: number; // Nombre de chiffres standard requis
  minLength: number;
  maxLength: number;
  placeholder: string;
  example: string;
  methods: string[];
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    dialCode: '+225',
    flag: '🇨🇮',
    phoneLength: 10,
    minLength: 10,
    maxLength: 10,
    placeholder: '0701020304',
    example: '10 chiffres (ex: 07 01 02 03 04)',
    methods: ['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money']
  }
];

export function getCountryByCode(code: string): CountryConfig {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
}

export function getCountryByDialCode(dialCode: string): CountryConfig {
  return COUNTRIES.find(c => c.dialCode === dialCode) || COUNTRIES[0];
}

export function getPhoneRequirementLabel(country: CountryConfig): string {
  if (country.minLength === country.maxLength) {
    return `${country.phoneLength} chiffres requis`;
  }
  return `${country.minLength} à ${country.maxLength} chiffres requis`;
}

export function validatePhoneForCountry(phone: string, country: CountryConfig): { valid: boolean; message?: string } {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return { valid: false, message: 'Veuillez saisir votre numéro de téléphone.' };
  }
  if (country.minLength === country.maxLength) {
    if (digits.length !== country.phoneLength) {
      return { 
        valid: false, 
        message: `Le numéro (${country.dialCode}) doit comporter exactement ${country.phoneLength} chiffres (${digits.length} saisi${digits.length > 1 ? 's' : ''}).` 
      };
    }
  } else {
    if (digits.length < country.minLength || digits.length > country.maxLength) {
      return { 
        valid: false, 
        message: `Le numéro (${country.dialCode}) doit comporter entre ${country.minLength} et ${country.maxLength} chiffres.` 
      };
    }
  }
  return { valid: true };
}
