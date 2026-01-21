import { DEFAULT_GAME_DATA } from "./data.js";

/** @type {string} */
const STORAGE_KEY = "arkana_game";

/**
 * @returns {any}
 */
export function loadGameData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(DEFAULT_GAME_DATA);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!validateGameData(parsed)) {
      return structuredClone(DEFAULT_GAME_DATA);
    }
    return parsed;
  } catch (err) {
    return structuredClone(DEFAULT_GAME_DATA);
  }
}

/**
 * @param {any} data
 * @returns {void}
 */
export function saveGameData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * @returns {boolean}
 */
export function hasSavedGame() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return false;
  }
  return true;
}

/**
 * @returns {void}
 */
export function resetSavedGame() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Minimal validation for v1.
 * @param {any} data
 * @returns {boolean}
 */
export function validateGameData(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (!data.world || typeof data.world.name !== "string") {
    return false;
  }
  if (!data.player || typeof data.player.name !== "string") {
    return false;
  }
  if (!Array.isArray(data.areas)) {
    return false;
  }
  return true;
}

/**
 * @param {any} data
 * @returns {void}
 */
export function exportWorldToFile(data) {
  const fileNameBase = (data && data.world && typeof data.world.name === "string") ? data.world.name : "arkana_world";
  const safeName = fileNameBase.replaceAll(/[^\w\- ]+/g, "").trim().replaceAll(" ", "_");
  const fileName = safeName.length > 0 ? `${safeName}.json` : "arkana_world.json";

  const payload = JSON.stringify(data, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * @param {File} file
 * @returns {Promise<any>}
 */
export async function importWorldFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!validateGameData(parsed)) {
    throw new Error("Invalid Arkana world file.");
  }

  return parsed;
}
