const STORAGE_KEY = 'four-seasons-story-save'

export function saveGame(state) {
  const data = JSON.parse(JSON.stringify(state))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadGame(state) {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  try {
    const data = JSON.parse(raw)
    Object.assign(state, data)
    return true
  } catch {
    return false
  }
}

export function clearSave() {
  localStorage.removeItem(STORAGE_KEY)
}
