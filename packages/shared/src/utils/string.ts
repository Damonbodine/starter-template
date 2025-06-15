/**
 * String utility functions for text manipulation and formatting
 */

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts string to title case
 * @param str - String to convert
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Converts string to camelCase
 * @param str - String to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Converts string to kebab-case
 * @param str - String to convert
 * @returns kebab-case string
 */
export function toKebabCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts string to snake_case
 * @param str - String to convert
 * @returns snake_case string
 */
export function toSnakeCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Generates a URL-friendly slug from a string
 * @param str - String to slugify
 * @param maxLength - Maximum length of slug
 * @returns URL slug
 */
export function slugify(str: string, maxLength = 50): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength)
    .replace(/-+$/, ''); // Remove trailing hyphen if truncated
}

/**
 * Truncates text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncates text at word boundaries
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateWords(text: string, maxLength: number, suffix = '...'): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

/**
 * Highlights search terms in text
 * @param text - Text to highlight
 * @param searchTerm - Term to highlight
 * @param highlightClass - CSS class for highlighting
 * @returns Text with highlighted terms
 */
export function highlightText(
  text: string,
  searchTerm: string,
  highlightClass = 'highlight'
): string {
  if (!text || !searchTerm || typeof text !== 'string' || typeof searchTerm !== 'string') {
    return text || '';
  }
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * Escapes special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeRegExp(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes HTML tags from a string
 * @param html - HTML string
 * @returns Plain text
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escapes HTML characters to prevent XSS
 * @param str - String to escape
 * @returns HTML-safe string
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Unescapes HTML entities
 * @param str - String with HTML entities
 * @returns Unescaped string
 */
export function unescapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => map[entity]);
}

/**
 * Pads a string to a specified length
 * @param str - String to pad
 * @param length - Target length
 * @param char - Character to pad with
 * @param direction - Padding direction
 * @returns Padded string
 */
export function pad(
  str: string,
  length: number,
  char = ' ',
  direction: 'left' | 'right' | 'both' = 'left'
): string {
  if (!str || typeof str !== 'string') str = '';
  if (str.length >= length) return str;
  
  const padLength = length - str.length;
  const padString = char.repeat(padLength);
  
  switch (direction) {
    case 'right':
      return str + padString;
    case 'both':
      const leftPad = Math.floor(padLength / 2);
      const rightPad = padLength - leftPad;
      return char.repeat(leftPad) + str + char.repeat(rightPad);
    default:
      return padString + str;
  }
}

/**
 * Reverses a string
 * @param str - String to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.split('').reverse().join('');
}

/**
 * Checks if a string is a palindrome
 * @param str - String to check
 * @param caseSensitive - Whether to consider case
 * @returns True if palindrome
 */
export function isPalindrome(str: string, caseSensitive = false): boolean {
  if (!str || typeof str !== 'string') return false;
  
  const cleaned = caseSensitive ? str : str.toLowerCase();
  return cleaned === reverse(cleaned);
}

/**
 * Counts occurrences of a substring
 * @param str - String to search in
 * @param substr - Substring to count
 * @param caseSensitive - Whether to consider case
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, substr: string, caseSensitive = true): number {
  if (!str || !substr || typeof str !== 'string' || typeof substr !== 'string') return 0;
  
  const searchStr = caseSensitive ? str : str.toLowerCase();
  const searchSubstr = caseSensitive ? substr : substr.toLowerCase();
  
  let count = 0;
  let index = 0;
  
  while ((index = searchStr.indexOf(searchSubstr, index)) !== -1) {
    count++;
    index += searchSubstr.length;
  }
  
  return count;
}

/**
 * Extracts words from a string
 * @param str - String to extract words from
 * @param pattern - Custom word pattern (optional)
 * @returns Array of words
 */
export function extractWords(str: string, pattern?: RegExp): string[] {
  if (!str || typeof str !== 'string') return [];
  
  const wordPattern = pattern || /\b\w+\b/g;
  return str.match(wordPattern) || [];
}

/**
 * Generates initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials
 * @returns Initials
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name || typeof name !== 'string') return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
}

/**
 * Masks sensitive information in a string
 * @param str - String to mask
 * @param visibleStart - Number of visible characters at start
 * @param visibleEnd - Number of visible characters at end
 * @param maskChar - Character to use for masking
 * @returns Masked string
 */
export function maskString(
  str: string,
  visibleStart = 2,
  visibleEnd = 2,
  maskChar = '*'
): string {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= visibleStart + visibleEnd) return str;
  
  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const maskLength = str.length - visibleStart - visibleEnd;
  
  return start + maskChar.repeat(maskLength) + end;
}

/**
 * Normalizes whitespace in a string
 * @param str - String to normalize
 * @returns Normalized string
 */
export function normalizeWhitespace(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Removes accents/diacritics from characters
 * @param str - String with accented characters
 * @returns String without accents
 */
export function removeAccents(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculates similarity between two strings using Levenshtein distance
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
export function similarity(str1: string, str2: string): number {
  if (!str1 || !str2 || typeof str1 !== 'string' || typeof str2 !== 'string') return 0;
  if (str1 === str2) return 1;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculates Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}