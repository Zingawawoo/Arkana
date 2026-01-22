/**
 * @typedef {Object} ArkanaWorld
 * @property {string} name
 * @property {string} description
 * @property {string|null} backgroundImage  // base64 data URL
 */

/**
 * @typedef {Object} ArkanaPlayer
 * @property {string} name
 * @property {number} maxHP
 * @property {number} stamina
 * @property {number} mana
 * @property {string|null} image            // base64 data URL
 */

/**
 * @typedef {Object} ArkanaGameData
 * @property {ArkanaWorld} world
 * @property {ArkanaPlayer} player
 * @property {Array<any>} areas
 */

import { loadGameData as loadFromStorage, saveGameData as saveToStorage, STORAGE_KEY } from "./storage.js";

export const DEFAULT_GAME_DATA = /** @type {ArkanaGameData} */ ({
  world: {
    name: "Untitled World",
    description: "",
    backgroundImage: null
  },
  player: {
    name: "Hero",
    maxHP: 100,
    stamina: 50,
    mana: 30,
    image: null
  },
  areas: []
});

const DEFAULT_PLAYER_HP = 30;
const DEFAULT_PLAYER_STAMINA = 20;
const DEFAULT_PLAYER_MANA = 15;
const DEFAULT_WEAPON_MODE = "sword";

/** @type {ArkanaGameData} */
let gameData = normalizeGameData(loadFromStorage());

let currentAreaIndex = 0;
let currentEntityIndex = 0;
let playerHP = DEFAULT_PLAYER_HP;
let playerStamina = DEFAULT_PLAYER_STAMINA;
let playerMana = DEFAULT_PLAYER_MANA;
let weaponMode = DEFAULT_WEAPON_MODE;

/**
 * @returns {ArkanaGameData}
 */
export function getGameData() {
  return gameData;
}

/**
 * @param {any} data
 * @returns {void}
 */
export function setGameData(data) {
  gameData = normalizeGameData(data);
}

/**
 * @param {any=} data
 * @returns {void}
 */
export function saveGameData(data) {
  if (typeof data !== "undefined") {
    gameData = normalizeGameData(data);
  }
  saveToStorage(gameData);
}

/**
 * @returns {ArkanaWorld|null}
 */
export function getCurrentArea() {
  if (!gameData || !Array.isArray(gameData.areas)) {
    return null;
  }
  return gameData.areas[currentAreaIndex] || null;
}

/**
 * @returns {any|null}
 */
export function getCurrentEntity() {
  const area = getCurrentArea();
  if (!area || !Array.isArray(area.entities)) {
    return null;
  }
  return area.entities[currentEntityIndex] || null;
}

/**
 * @returns {number}
 */
export function getCurrentAreaIndex() {
  return currentAreaIndex;
}

/**
 * @param {number} index
 * @returns {void}
 */
export function setCurrentAreaIndex(index) {
  currentAreaIndex = index;
}

/**
 * @returns {number}
 */
export function getCurrentEntityIndex() {
  return currentEntityIndex;
}

/**
 * @param {number} index
 * @returns {void}
 */
export function setCurrentEntityIndex(index) {
  currentEntityIndex = index;
}

/**
 * @returns {void}
 */
export function advanceArea() {
  currentAreaIndex += 1;
  currentEntityIndex = 0;
}

/**
 * @returns {void}
 */
export function advanceEntity() {
  currentEntityIndex += 1;
}

/**
 * @returns {number}
 */
export function getPlayerHP() {
  return playerHP;
}

/**
 * @param {number} value
 * @returns {void}
 */
export function setPlayerHP(value) {
  playerHP = value;
}

/**
 * @returns {void}
 */
export function resetPlayerHP() {
  playerHP = DEFAULT_PLAYER_HP;
}

/**
 * @returns {number}
 */
export function getPlayerStamina() {
  return playerStamina;
}

/**
 * @param {number} value
 * @returns {void}
 */
export function setPlayerStamina(value) {
  playerStamina = value;
}

/**
 * @returns {void}
 */
export function resetPlayerStamina() {
  playerStamina = DEFAULT_PLAYER_STAMINA;
}

/**
 * @returns {number}
 */
export function getPlayerMana() {
  return playerMana;
}

/**
 * @param {number} value
 * @returns {void}
 */
export function setPlayerMana(value) {
  playerMana = value;
}

/**
 * @returns {void}
 */
export function resetPlayerMana() {
  playerMana = DEFAULT_PLAYER_MANA;
}

/**
 * @returns {string}
 */
export function getWeaponMode() {
  return weaponMode;
}

/**
 * @param {string} mode
 * @returns {void}
 */
export function setWeaponMode(mode) {
  weaponMode = mode;
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

/**
 * @param {any} data
 * @returns {ArkanaGameData}
 */
function normalizeGameData(data) {
  if (!validateGameData(data)) {
    return structuredClone(DEFAULT_GAME_DATA);
  }
  return data;
}
