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
