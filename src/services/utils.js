export function randomStr() {
  return Math.random()
    .toString(36)
    .substring(7)
}
