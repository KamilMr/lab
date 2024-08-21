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
