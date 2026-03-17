export function normalizeString(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/ /g, '_');
}

export function normalizeField(obj, str) {
  if (Array.isArray(obj[str])) {
    obj[str] = obj[str].map(normalizeString)
  }
  else {
    obj[str] = normalizeString(obj[str])
  }
}
