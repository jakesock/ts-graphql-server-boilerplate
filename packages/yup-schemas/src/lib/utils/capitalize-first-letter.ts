/**
 * Capitalizes the first character in a string.
 * @param {string} string - String to capitalize.
 * @return {string} Capitalized string.
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
