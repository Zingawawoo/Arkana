import { loadGameData } from "./storage.js";

/* ---------------- Data ---------------- */

const gameData = loadGameData();

let areaIndex = 0;
let entityIndex = 0;

let playerHP = 30;

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

loadArea();

/* ---------------- Core Flow ---------------- */

function loadArea() {
  if (areaIndex >= gameData.areas.length) {
    showEndScreen();
    return;
  }

  const area = gameData.areas[areaIndex];

  areaTitle.textContent = area.name || "Unknown Area";
  areaDescription.textContent = area.description || "";

  if (area.backgroundImage) {
    playBackground.style.backgroundImage = `url(${area.backgroundImage})`;
  }

  entityIndex = 0;
  loadEntity();
}

function loadEntity() {
  const area = gameData.areas[areaIndex];

  // No more entities → next area
  if (entityIndex >= area.entities.length) {
    areaIndex++;
    loadArea();
    return;
  }

  const entity = area.entities[entityIndex];

  if (entity.type === "npc") showNPC(entity);
  if (entity.type === "enemy") showEnemy(entity);
  if (entity.type === "checkpoint") showCheckpoint(entity);
}

/* ---------------- NPC ---------------- */

function showNPC(npc) {
  playBody.innerHTML = "";
  playFooter.innerHTML = "";

  const name = document.createElement("div");
  name.className = "dialogue-name";
  name.textContent = npc.name;

  const text = document.createElement("div");
  text.className = "dialogue-text";
  text.textContent = npc.dialogue;

  playBody.appendChild(name);
  playBody.appendChild(text);

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Continue";

  btn.onclick = () => {
    entityIndex++;
    loadEntity();
  };

  playFooter.appendChild(btn);
}

/* ---------------- Checkpoint ---------------- */

function showCheckpoint(cp) {
  playBody.innerHTML = "";
  playFooter.innerHTML = "";

  const text = document.createElement("div");
  text.className = "dialogue-text";
  text.textContent = "You rest at a checkpoint. Your strength returns.";

  playBody.appendChild(text);

  if (cp.healsPlayer) playerHP = 30;

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Continue";

  btn.onclick = () => {
    entityIndex++;
    loadEntity();
  };

  playFooter.appendChild(btn);
}

/* ---------------- Enemy (Simple Combat) ---------------- */

function showEnemy(enemy) {
  let enemyHP = enemy.hp;

  function render() {
    playBody.innerHTML = "";
    playFooter.innerHTML = "";

    const title = document.createElement("div");
    title.className = "dialogue-name";
    title.textContent = enemy.name;

    const box = document.createElement("div");
    box.className = "combat-box";

    // Enemy HP
    const enemyLabel = document.createElement("div");
    enemyLabel.textContent = `Enemy HP: ${enemyHP}`;

    const enemyBar = document.createElement("div");
    enemyBar.className = "hp-bar";

    const enemyFill = document.createElement("div");
    enemyFill.className = "hp-fill";
    enemyFill.style.width = `${(enemyHP / enemy.hp) * 100}%`;

    enemyBar.appendChild(enemyFill);

    // Player HP
    const playerLabel = document.createElement("div");
    playerLabel.textContent = `Your HP: ${playerHP}`;

    box.appendChild(enemyLabel);
    box.appendChild(enemyBar);
    box.appendChild(playerLabel);

    playBody.appendChild(title);
    playBody.appendChild(box);

    // Buttons
    const btnAttack = document.createElement("button");
    btnAttack.className = "btn btn-primary";
    btnAttack.textContent = "Attack";

    btnAttack.onclick = () => {
      // Player hits
      enemyHP -= 5;

      // Enemy hits back if alive
      if (enemyHP > 0) {
        playerHP -= enemy.damage;
      }

      // Lose
      if (playerHP <= 0) {
        showDeath();
        return;
      }

      // Win
      if (enemyHP <= 0) {
        entityIndex++;
        loadEntity();
        return;
      }

      render();
    };

    playFooter.appendChild(btnAttack);
  }

  render();
}

/* ---------------- Death ---------------- */

function showDeath() {
  playBody.innerHTML = "";
  playFooter.innerHTML = "";

  const text = document.createElement("div");
  text.className = "dialogue-text";
  text.textContent = "You were defeated... but you rise again at the last checkpoint.";

  playBody.appendChild(text);

  playerHP = 30;

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Continue";

  btn.onclick = () => {
    loadEntity();
  };

  playFooter.appendChild(btn);
}

/* ---------------- End ---------------- */

function showEndScreen() {
  playBody.innerHTML = "";
  playFooter.innerHTML = "";

  const title = document.createElement("div");
  title.className = "dialogue-name";
  title.textContent = "The End";

  const text = document.createElement("div");
  text.className = "dialogue-text";
  text.textContent = "Your journey through this world is complete.";

  playBody.appendChild(title);
  playBody.appendChild(text);

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.textContent = "Return Home";

  btn.onclick = () => {
    window.location.href = "./index.html";
  };

  playFooter.appendChild(btn);
}
