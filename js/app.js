import {
  loadGameData,
  saveGameData,
  hasSavedGame,
  resetSavedGame,
  exportWorldToFile,
  importWorldFromFile
} from "./storage.js";

/** @type {any} */
let gameData = loadGameData();

const btnBuild = /** @type {HTMLButtonElement} */ (document.getElementById("btnBuild"));
const btnPlay = /** @type {HTMLButtonElement} */ (document.getElementById("btnPlay"));
const btnImport = /** @type {HTMLButtonElement} */ (document.getElementById("btnImport"));
const btnExport = /** @type {HTMLButtonElement} */ (document.getElementById("btnExport"));
const btnReset = /** @type {HTMLButtonElement} */ (document.getElementById("btnReset"));
const fileImport = /** @type {HTMLInputElement} */ (document.getElementById("fileImport"));

const saveStatus = /** @type {HTMLParagraphElement} */ (document.getElementById("saveStatus"));
const worldPreview = /** @type {HTMLDivElement} */ (document.getElementById("worldPreview"));
const pillAreas = /** @type {HTMLSpanElement} */ (document.getElementById("pillAreas"));
const pillEntities = /** @type {HTMLSpanElement} */ (document.getElementById("pillEntities"));

const panelMessage = /** @type {HTMLElement} */ (document.getElementById("panelMessage"));
const panelTitle = /** @type {HTMLElement} */ (document.getElementById("panelTitle"));
const panelText = /** @type {HTMLElement} */ (document.getElementById("panelText"));
const btnClosePanel = /** @type {HTMLButtonElement} */ (document.getElementById("btnClosePanel"));

/**
 * @returns {void}
 */
function updateHomeUI() {
  const worldName = gameData.world && gameData.world.name ? gameData.world.name : "Untitled World";
  const worldDesc = gameData.world && gameData.world.description ? gameData.world.description : "No description yet.";

  worldPreview.innerHTML = `
    <div style="font-weight: 800; margin-bottom: 6px;">${escapeHtml(worldName)}</div>
    <div style="color: rgba(58,47,47,0.72); line-height: 1.35;">${escapeHtml(worldDesc)}</div>
  `;

  const areasCount = Array.isArray(gameData.areas) ? gameData.areas.length : 0;
  const entitiesCount = countEntities(gameData);

  pillAreas.textContent = `${areasCount} areas`;
  pillEntities.textContent = `${entitiesCount} entities`;

  const canPlay = hasSavedGame();
  btnPlay.disabled = !canPlay;

  saveStatus.textContent = canPlay ? "Saved locally. You can export this world as a JSON file." : "No saved world yet. Build one to enable play & export.";
}

/**
 * @param {any} data
 * @returns {number}
 */
function countEntities(data) {
  if (!data || !Array.isArray(data.areas)) {
    return 0;
  }
  let total = 0;
  for (const area of data.areas) {
    if (area && Array.isArray(area.entities)) {
      total += area.entities.length;
    }
  }
  return total;
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * @param {string} title
 * @param {string} message
 * @returns {void}
 */
function showPanel(title, message) {
  panelTitle.textContent = title;
  panelText.textContent = message;
  panelMessage.classList.remove("hidden");
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

/**
 * @returns {void}
 */
function hidePanel() {
  panelMessage.classList.add("hidden");
}

btnClosePanel.addEventListener("click", () => {
  hidePanel();
});

btnBuild.addEventListener("click", () => {
  window.location.href = "./build.html";
});

btnPlay.addEventListener("click", () => {
  window.location.href = "./play.html";
});

btnExport.addEventListener("click", () => {
  exportWorldToFile(gameData);
});

btnImport.addEventListener("click", () => {
  fileImport.value = "";
  fileImport.click();
});

fileImport.addEventListener("change", async () => {
  if (!fileImport.files || fileImport.files.length === 0) {
    return;
  }

  const file = fileImport.files[0];
  try {
    const imported = await importWorldFromFile(file);
    gameData = imported;
    saveGameData(gameData);
    updateHomeUI();
    showPanel("Imported!", "World loaded successfully. You can now export it again or start building on top of it.");
  } catch (err) {
    showPanel("Import failed", "That file doesn’t look like a valid Arkana world JSON.");
  }
});

btnReset.addEventListener("click", () => {
  const ok = window.confirm("This will delete your current saved world in this browser. Continue?");
  if (!ok) {
    return;
  }
  resetSavedGame();
  gameData = loadGameData();
  saveGameData(gameData);
  updateHomeUI();
  showPanel("Reset complete", "Your saved world was cleared. You’re back to a fresh Arkana scaffold.");
});

/**
 * v1: ensure we always have something to export/import test with.
 * @returns {void}
 */
function ensureInitialSave() {
  // We only auto-save a default once, so users can immediately export/import to test.
  const already = hasSavedGame();
  if (!already) {
    saveGameData(gameData);
  }
}

ensureInitialSave();
updateHomeUI();
