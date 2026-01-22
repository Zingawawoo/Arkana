/** @type {string} */
export const STORAGE_KEY = "arkana_game";

/**
 * @returns {any|null}
 */
export function loadGameData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    return null;
  }
}

/**
 * @param {any} data
 * @returns {void}
 */
export function saveGameData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
