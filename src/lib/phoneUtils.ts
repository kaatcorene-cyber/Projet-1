// Utilitaires téléphoniques et résolutions multi-formats

export const ALL_DIAL_CODES = ['+225', '+228', '+226', '+229', '+227', '+223', '+221', '+237', '+224'];

export const BANNED_PHONES = ['2250574641956', '0574641956'];

export function isPermanentlyDeletedPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return false;
  return digits === '2250574641956' || 
         digits === '0574641956' || 
         digits.endsWith('0574641956') || 
         digits.endsWith('574641956');
}

/**
 * Génère l'ensemble exhaustif des formats possibles sous lesquels
 * un numéro a pu être enregistré en base (avec/sans indicatif, avec/sans zéro, etc.).
 */
export function generatePhoneCandidates(inputPhone: string, defaultDialCode = '+225'): string[] {
  const clean = inputPhone.trim().replace(/[\s\-\(\)\.]/g, '');
  const pureDigits = clean.replace(/\D/g, '');
  if (!pureDigits && !clean) return [];

  const candidates = new Set<string>();

  if (clean) candidates.add(clean);
  if (pureDigits) {
    candidates.add(pureDigits);
    candidates.add(`+${pureDigits}`);
  }

  // Détection d'un indicatif déjà présent dans la saisie
  let detectedDial = defaultDialCode.startsWith('+') ? defaultDialCode : `+${defaultDialCode}`;
  let national = pureDigits;

  for (const dial of ALL_DIAL_CODES) {
    const dialDigits = dial.replace('+', '');
    if (clean.startsWith(dial)) {
      detectedDial = dial;
      national = clean.slice(dial.length).replace(/\D/g, '');
      break;
    } else if (pureDigits.startsWith(dialDigits) && pureDigits.length > dialDigits.length + 5) {
      detectedDial = dial;
      national = pureDigits.slice(dialDigits.length);
      break;
    }
  }

  const nationalNoZero = national.replace(/^0+/, '');
  const nationalWithZero = national ? (national.startsWith('0') ? national : `0${national}`) : '';

  // Indicatifs prioritaires à tester (indicatif détecté, indicatif choisi, puis tous les indicatifs)
  const priorityDials = Array.from(new Set([detectedDial, defaultDialCode, ...ALL_DIAL_CODES]));

  for (const dial of priorityDials) {
    const dialDigits = dial.replace('+', '');

    if (national) {
      candidates.add(`${dial}${national}`);
      candidates.add(`${dialDigits}${national}`);
    }
    if (nationalNoZero) {
      candidates.add(`${dial}${nationalNoZero}`);
      candidates.add(`${dialDigits}${nationalNoZero}`);
    }
    if (nationalWithZero) {
      candidates.add(`${dial}${nationalWithZero}`);
      candidates.add(`${dialDigits}${nationalWithZero}`);
    }
  }

  // Variantes nationales pures
  if (national) candidates.add(national);
  if (nationalNoZero) candidates.add(nationalNoZero);
  if (nationalWithZero) candidates.add(nationalWithZero);

  return Array.from(candidates).filter(c => c && c.length >= 6);
}
