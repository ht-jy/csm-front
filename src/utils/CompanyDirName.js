import md5 from 'md5';

export const companyDirName = (companyName) => {
  const hash = md5(companyName);
  const part = hash.slice(0, 12);
  return parseInt(part, 16).toString(36);
}