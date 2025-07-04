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

  /**
   * Pick required keys from source and return missing keys
   * @param {Object} source - The source object to pick from
   * @param {Array} requiredKeys - The keys to pick from the source
   */
  const pickWithMissing = (source, requiredKeys) => {
    const data = {};
    const missingKeys = [];
    requiredKeys.forEach(path => {
      if (!Array.isArray(path)) path = [path, path];
      const v = _.get(source, path[0]);
      if (v === undefined) return missingKeys.push(path[0]);

      _.set(data, path[1], v);
    })
    return {data, missingKeys}
  }

  // example of usage
  const requiredKeys = [
    'country',
    ['square.southwest.lng', 'square.southwest.lon'],
    'square.southwest.lat',
    ['square.northeast.lng','square.northeast.lon'],
    'square.northeast.lat',
    'nearestPlace',
    ['coordinates.lng','lon'],
    ['coordinates.lat','lat'],
    ['words','w3w'],
    'language',
    'map'
  ]
  const {data, missingKeys} = pickWithMissing(respW3W, requiredKeys)

const getUtcDate = (date = new Date()) => {
  const isoDate = date.toISOString();
  return `${isoDate.substring(0, 10)} ${isoDate.substring(11, 19)}`;
}

/*Basic checking if file is pdf*/
const handleUploadStatement = async (req, res, next) => {

  if (req.headers['content-type'] !== 'application/pdf')
    return next('requried_application/pdf');

  if (!Buffer.isBuffer(req.body)) return next('invalid_input');
  const fileSignature = req.body.slice(0, 5).toString();

  if (fileSignature !== '%PDF-') return next('not_pdf');

  res.ch.ok();
};

const pluckByKeys = (data = {}, keys = []) => {
  // validate keys, has to be an array or string
  if (!Array.isArray(keys) && typeof keys !== 'string') return data;

  // also when no keys are provided skip
  if (!keys.length) return data;
  const dict = _.keys(data);

  const requested = Array.isArray(keys) ? keys : keys.toString().split(',');
  return requested.reduce((acc, v) => {
    if (dict.includes(v)) acc[v] = data[v];
    return acc;
  }, {});
};