const validateLink = (link: string): boolean => {
  try {
    new URL(link);
    return true;
  } catch (e) {
    return false;
  }
};

const cleanUrl = (url: string): string => {
  return url
    .replace(/^https/, '')
    .replaceAll(/[:\/\\.,-]/g, '')
    .replaceAll('#', '');
};

export {validateLink, cleanUrl};
