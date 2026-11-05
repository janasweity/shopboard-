export function claimEntranceSession(replay = false) {
  const key = 'raha-entrance-seen'
  try {
    if (!replay && sessionStorage.getItem(key)) return false
    sessionStorage.setItem(key, '1')
    return true
  } catch {
    return false
  }
}
