export const KEY_TOKEN = 'token'

export function getStorage(key) {
  let result = null
  try {
    result = JSON.parse(localStorage.getItem(key))
  } catch (e) {}
  return result
}

export function setStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function clearStorage(key) {
  localStorage.removeItem(key)
}