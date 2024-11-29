// lodash based
const reduceProp = prop => obj => _.reduce(_.omit(obj, prop), (acc, val, key) => {
  if (typeof val === 'object') acc[key] = reduceProp(prop)(val);
  else acc[key] = val;

  return acc;
}, {})

/** Omit property in array of objects
 * @param {object[]} collection - [{some: 'one'}]
 * @param {string[]} property - ['country', 'home']
 */
const omitProperties = (collection, property) => {
  return _.map(collection, reduceProp(property));
};

/**
 * Renames the keys of an object based on a provided mapping.
 *
 * @param {object} data - The object whose keys will be renamed.
 * @param {Array<Array<string>>} keys - [[oldKey, newKey], [...]]
 */ const renameKeys = (data, keys) => {
  return _.mapKeys(data, (_, key) => {
    const newKey = keys.find(([oldKey]) => oldKey === key)?.[1];
    return newKey || key;
  });
};
