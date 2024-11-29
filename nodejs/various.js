/*Basic checking if file is pdf*/ 
const handleUploadStatement = async (req, res, next) => {

  if (req.headers['content-type'] !== 'application/pdf')
    return next('requried_application/pdf');

  if (!Buffer.isBuffer(req.body)) return next('invalid_input');
  const fileSignature = req.body.slice(0, 5).toString();

  if (fileSignature !== '%PDF-') return next('not_pdf');

  res.ch.ok();
};
