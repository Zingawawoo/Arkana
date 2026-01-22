import { getGameData } from "./data.js";
import { createCombatController } from "./play/combat.js";
import { createDialogueController } from "./play/dialogue.js";
import { createPlayEngine } from "./play/engine.js";

/* ---------------- Data ---------------- */

const gameData = getGameData();

/* ---------------- Elements ---------------- */

const btnHome = document.getElementById("btnHome");

const worldTitle = document.getElementById("worldTitle");
const playBackground = document.getElementById("playBackground");

const areaTitle = document.getElementById("areaTitle");
const areaDescription = document.getElementById("areaDescription");

const playBody = document.getElementById("playBody");
const playFooter = document.getElementById("playFooter");

/* ---------------- Navigation ---------------- */

btnHome.addEventListener("click", () => {
  window.location.href = "./index.html";
});

/* ---------------- Init ---------------- */

worldTitle.textContent = gameData.world.name || "Arkana";

const engine = createPlayEngine({
  areaTitle,
  areaDescription,
  playBackground,
  playBody,
  playFooter,
  onReturnHome: () => {
    window.location.href = "./index.html";
  }
});

const dialogue = createDialogueController({
  playBody,
  playFooter,
  onAdvance: () => engine.advanceAndLoadEntity()
});

const combat = createCombatController({
  playBody,
  playFooter,
  onAdvance: () => engine.advanceAndLoadEntity(),
  onRetry: () => engine.loadEntity()
});

engine.setRenderers({
  showNPC: dialogue.showNPC,
  showEnemy: combat.showEnemy
});

engine.init();
