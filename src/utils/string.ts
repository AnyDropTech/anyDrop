/**
 * Generate a random string
 * @returns string
 */
export function uuid() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      result += characters.charAt(randomIndex)
    }
    if (i < 3)
      result += '-'
  }
  return result
}

/**
 *  Generate a random number
 * @param limit
 * @returns
 */
export function randomNum(limit: number = 4) {
  const characters = '0123456789'
  let result = ''
  for (let i = 0; i < limit; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}
