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