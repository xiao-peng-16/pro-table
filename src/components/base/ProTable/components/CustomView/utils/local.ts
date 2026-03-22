/**
 * 设置localStorage
 * @param key 
 * @param value 
 * @returns 
 */
export function setLocal(key:string, value: string | object) {
  if (!key) return
  if (typeof value !== 'string') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(key, value)
}


/**
 * 读取localStorage
 * @param key 
 * @param value 
 * @returns 
 */
export function getLocal(key:string) {
  if (!key) return
  let value = window.localStorage.getItem(key)
  try {
    return value && JSON.parse(value)
  } catch (error) {
    return value
  }
}


/**
 * 设置localStorage
 * @param key 
 * @param value 
 * @returns 
 */
export function removeLocal(key:string) {
  if (!key) return
  window.localStorage.removeItem(key)
}
