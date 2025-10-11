/**
 * Generates a specified number of unique IDs by checking against existing database records.
 * Uses batch generation and database lookups to efficiently ensure uniqueness.
 * 
 * @param {import('mysql2/promise').PoolConnection} conn - Active MySQL database connection from pool
 * @param {number} count - Number of unique IDs to generate
 * @param {Function} generator - ID generation function that returns a single ID when called
 * @param {string} entity - Database table name to check for existing IDs
 * @param {string} column - Column name in the table where IDs are stored
 * @param {number} [maxRetries=3] - Maximum number of batch generation attempts before throwing error
 * 
 * @returns {Promise<Array<string>>} Array of unique IDs that don't exist in the database
 * 
 * @throws {Error} If unable to generate the requested count of unique IDs within maxRetries attempts
 * 
 * @example
 * // Generate 5 unique flight IDs
 * const flightIds = await addUniqueIds(
 *   conn,
 *   5,
 *   () => generateFlightId(),
 *   'flight',
 *   'flight_id'
 * );
 * // Returns: ['FLT001', 'FLT002', 'FLT003', 'FLT004', 'FLT005']
 * 
 * @note This function requires an active database connection and should be called within a transaction
 *       if the generated IDs need to be inserted immediately after.
 * @note Generates 3x the remaining needed IDs per attempt to reduce retry probability.
 */
const addUniqueIds = async (conn, count, generator, entity, column, maxRetries = 3) => {
  let uniqueIds = [];
  let attempts = 0;

  while (uniqueIds.length < count && attempts < maxRetries) {
    // Generate batch of candidates (3x requested to reduce retries)
    // Oversizing reduces likelihood of collisions requiring additional attempts
    const batchSize = (count - uniqueIds.length) * 3;
    const candidates = makeIds(batchSize, generator);

    // Check all candidates in single query to minimize database roundtrips
    let existingIds = [];
    if (!_.isEmpty(candidates)) {
      // Build parameterized query with placeholders for SQL injection protection
      const placeholders = _.repeat('?,', candidates.length).slice(0, -1);
      const query = `SELECT ${column} FROM ${entity} WHERE ${column} IN (${placeholders})`;
      
      // Execute query with candidates as parameters
      const [rows] = await conn.execute(query, candidates);
      
      // Extract just the ID values from result rows
      existingIds = _.map(rows, column);
    }

    // Filter out existing IDs using lodash difference
    // Returns only candidates that don't exist in the database
    const newUnique = _.difference(candidates, existingIds);

    // Add unique ones up to count needed
    // Take only as many as still required to reach target count
    uniqueIds = _.concat(uniqueIds, _.take(newUnique, count - uniqueIds.length));

    attempts++;
  }

  // Verify we successfully generated the requested number of unique IDs
  if (uniqueIds.length < count) {
    throw new Error(
      `Failed to generate ${count} unique IDs for ${entity}.${column} after ${maxRetries} attempts`
    );
  }

  return uniqueIds;
};
