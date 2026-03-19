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

export function denormalizeString(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/^./, str[0].toUpperCase())
}

export function denormalizeField(obj, str) {
  if (Array.isArray(obj[str])) {
    obj[str] = obj[str].map(denormalizeString)
  }
  else {
    obj[str] = denormalizeString(obj[str])
  }
}
