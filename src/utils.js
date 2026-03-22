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

export const boulderColorStyles = [
  {name: 'unset', class: 'bg-slate-700 border-slate-600', icon: '∅'},
  {name: 'red', class: 'bg-red-500 border-red-400'},
  {name: 'green', class: 'bg-emerald-500 border-emerald-400'},
  {name: 'blue', class: 'bg-blue-500 border-blue-400'},
  {name: 'yellow', class: 'bg-yellow-400 border-yellow-300'},
  {name: 'white', class: 'bg-white border-slate-200'},
  {name: 'black', class: 'bg-black border-slate-800'},
  {name: 'purple', class: 'bg-purple-600 border-purple-400'},
  {name: 'gray', class: 'bg-gray-600 border-gray-500/50'},
  {name: 'colorful', class: 'bg-gradient-to-tr from-yellow-500 via-purple-700 to-blue-500 border-none'},
]
