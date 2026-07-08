export interface ValidationResult {
  valid: boolean;
  word: string;
  message?: string;
}

export function validateWordInput(input: string): ValidationResult {
  if (input.length === 0) {
    return { valid: false, word: '', message: 'Please enter a word.' };
  }

  const word = input.trim();

  if (word.length === 0) {
    return { valid: false, word, message: 'Please enter a valid word.' };
  }

  if (word.length > 50) {
    return { valid: false, word, message: 'Word is too long.' };
  }

  if (!/^[A-Za-z]+$/.test(word)) {
    return { valid: false, word, message: 'Only letters are allowed.' };
  }

  return { valid: true, word: word.toLowerCase() };
}

