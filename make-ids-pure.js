/**
 * Generates an array of unique random alphanumeric IDs
 * 
 * @param {number} length - The length of each ID to generate
 * @param {number} [count=1] - The number of unique IDs to generate (defaults to 1)
 * @returns {string[]} Array of unique random alphanumeric strings
 * 
 * @example
 * makeIds(8)          // Returns ['aB3dE9fG']
 * makeIds(5, 3)       // Returns ['xY2aB', 'pQ7mN', 'jK1cD']
 * 
 * Implementation notes:
 * - Uses a sentinel counter (1000) to prevent infinite loops if count is too large
 *   relative to the possible unique combinations
 * - Checks for duplicates using array.includes() before adding new IDs
 * - Character set: A-Z, a-z, 0-9 (62 possible characters)
 * - Will return fewer than 'count' IDs if sentinel limit is reached
 */
const makeIds = (length, count = 1) => {
  /**
   * Generates a single random alphanumeric ID
   * 
   * @returns {string} Random alphanumeric string of specified length
   */
  const makeNew = () => {
    let tR = '';
    // Available characters for ID generation: uppercase, lowercase, and digits
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    // Build the ID character by character
    for (let i = 0; i < length; i++) {
      tR += characters[Math.floor(Math.random() * characters.length)];
    }
    return tR;
  };

  // Array to store unique IDs
  const tR = [];
  
  // Sentinel to prevent infinite loops (max 1000 generation attempts)
  let SENTINEL = 1000;

  // Generate IDs until we have enough unique ones or hit the sentinel limit
  while (tR.length < count && SENTINEL--) {
    const next = makeNew();
    // Only add if not already in the array (ensures uniqueness)
    if (!tR.includes(next)) tR.push(next);
  }

  return tR;
};
