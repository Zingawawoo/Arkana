import { loadGameData, saveGameData } from "./storage.js";

/* ---------------- Data ---------------- */

let gameData = loadGameData();

/* ---------------- Elements ---------------- */

// Top navigation
const btnBack = document.getElementById("btnBack");

// Steps
const stepWorld = document.getElementById("stepWorld");
const stepAreas = document.getElementById("stepAreas");
const stepEntities = document.getElementById("stepEntities");

// Step buttons
const btnNext = document.getElementById("btnNext");
const btnBackToWorld = document.getElementById("btnBackToWorld");
const btnEditEntities = document.getElementById("btnEditEntities");
const btnBackToAreas = document.getElementById("btnBackToAreas");

// World inputs
const inputName = document.getElementById("inputName");
const inputDescription = document.getElementById("inputDescription");
const inputImage = document.getElementById("inputImage");

const previewName = document.getElementById("previewName");
const previewDescription = document.getElementById("previewDescription");
const previewBg = document.getElementById("previewBg");
const saveIndicator = document.getElementById("saveIndicator");

// Areas UI
const btnAddArea = document.getElementById("btnAddArea");
const areasList = document.getElementById("areasList");
const areaEditor = document.getElementById("areaEditor");

const areaName = document.getElementById("areaName");
const areaDescription = document.getElementById("areaDescription");
const areaImage = document.getElementById("areaImage");

const areaPreviewName = document.getElementById("areaPreviewName");
const areaPreviewDescription = document.getElementById("areaPreviewDescription");
const areaPreviewBg = document.getElementById("areaPreviewBg");

// Entities UI
const btnAddNPC = document.getElementById("btnAddNPC");
const btnAddEnemy = document.getElementById("btnAddEnemy");
const btnAddCheckpoint = document.getElementById("btnAddCheckpoint");
const entitiesList = document.getElementById("entitiesList");
const entityEditor = document.getElementById("entityEditor");
const entitiesSubtitle = document.getElementById("entitiesSubtitle");

// State
let selectedAreaIndex = null;
let selectedEntityIndex = null;

/* ---------------- Navigation ---------------- */

// Home
btnBack.addEventListener("click", () => {
  saveGameData(gameData);
  window.location.href = "./index.html";
});

// World -> Areas
btnNext.addEventListener("click", () => {
  stepWorld.classList.add("hidden");
  stepAreas.classList.remove("hidden");
  renderAreasList();
});

// Areas -> World
btnBackToWorld.addEventListener("click", () => {
  stepAreas.classList.add("hidden");
  stepWorld.classList.remove("hidden");
});

// Areas -> Entities
btnEditEntities.addEventListener("click", () => {
  if (selectedAreaIndex === null) {
    alert("Select an area first.");
    return;
  }

  const area = gameData.areas[selectedAreaIndex];
  entitiesSubtitle.textContent = `Entities in "${area.name}"`;

  stepAreas.classList.add("hidden");
  stepEntities.classList.remove("hidden");

  selectedEntityIndex = null;
  renderEntitiesList();
  renderEntityEditor();
});

// Entities -> Areas
btnBackToAreas.addEventListener("click", () => {
  stepEntities.classList.add("hidden");
  stepAreas.classList.remove("hidden");
});

/* ---------------- World Init ---------------- */

function loadWorldIntoForm() {
  inputName.value = gameData.world.name || "";
  inputDescription.value = gameData.world.description || "";

  previewName.textContent = gameData.world.name || "Untitled World";
  previewDescription.textContent = gameData.world.description || "No description yet.";

  if (gameData.world.backgroundImage) {
    previewBg.style.backgroundImage = `url(${gameData.world.backgroundImage})`;
  } else {
    previewBg.style.backgroundImage = "none";
  }
}

/* ---------------- Autosave ---------------- */

function markSaved() {
  saveIndicator.textContent = "Saved";
}

function markSaving() {
  saveIndicator.textContent = "Saving...";
}

/* ---------------- World Handlers ---------------- */

inputName.addEventListener("input", () => {
  markSaving();
  gameData.world.name = inputName.value;
  previewName.textContent = inputName.value || "Untitled World";
  saveGameData(gameData);
  markSaved();
});

inputDescription.addEventListener("input", () => {
  markSaving();
  gameData.world.description = inputDescription.value;
  previewDescription.textContent = inputDescription.value || "No description yet.";
  saveGameData(gameData);
  markSaved();
});

inputImage.addEventListener("change", () => {
  if (!inputImage.files.length) return;

  const reader = new FileReader();
  markSaving();

  reader.onload = () => {
    gameData.world.backgroundImage = reader.result;
    previewBg.style.backgroundImage = `url(${reader.result})`;
    saveGameData(gameData);
    markSaved();
  };

  reader.readAsDataURL(inputImage.files[0]);
});

/* ---------------- Areas ---------------- */

btnAddArea.addEventListener("click", () => {
  const newArea = {
    id: crypto.randomUUID(),
    name: "New Area",
    description: "",
    backgroundImage: null,
    entities: []
  };

  gameData.areas.push(newArea);
  saveGameData(gameData);

  renderAreasList();
  selectArea(gameData.areas.length - 1);
});

function renderAreasList() {
  areasList.innerHTML = "";

  gameData.areas.forEach((area, index) => {
    const card = document.createElement("div");
    card.className = "area-card" + (index === selectedAreaIndex ? " active" : "");

    const title = document.createElement("h4");
    title.textContent = area.name || "Untitled Area";

    const desc = document.createElement("p");
    desc.textContent = area.description || "No description";

    const info = document.createElement("div");
    info.appendChild(title);
    info.appendChild(desc);

    const controls = document.createElement("div");
    controls.className = "area-controls";

    const up = document.createElement("button");
    up.textContent = "↑";
    up.onclick = () => moveArea(index, -1);

    const down = document.createElement("button");
    down.textContent = "↓";
    down.onclick = () => moveArea(index, 1);

    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = () => deleteArea(index);

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    card.appendChild(info);
    card.appendChild(controls);
    card.addEventListener("click", () => selectArea(index));

    areasList.appendChild(card);
  });
}

function selectArea(index) {
  selectedAreaIndex = index;
  areaEditor.classList.remove("hidden");

  const area = gameData.areas[index];

  areaName.value = area.name || "";
  areaDescription.value = area.description || "";

  areaPreviewName.textContent = area.name || "Untitled Area";
  areaPreviewDescription.textContent = area.description || "No description yet.";

  if (area.backgroundImage) {
    areaPreviewBg.style.backgroundImage = `url(${area.backgroundImage})`;
  } else {
    areaPreviewBg.style.backgroundImage = "none";
  }

  renderAreasList();
}

function moveArea(index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= gameData.areas.length) return;

  const temp = gameData.areas[index];
  gameData.areas[index] = gameData.areas[newIndex];
  gameData.areas[newIndex] = temp;

  selectedAreaIndex = newIndex;
  saveGameData(gameData);
  renderAreasList();
}

function deleteArea(index) {
  if (!confirm("Delete this area?")) return;

  gameData.areas.splice(index, 1);
  selectedAreaIndex = null;
  areaEditor.classList.add("hidden");

  saveGameData(gameData);
  renderAreasList();
}

/* ---------------- Entities ---------------- */

// Create NPC
btnAddNPC.addEventListener("click", () => createEntity("npc"));
btnAddEnemy.addEventListener("click", () => createEntity("enemy"));
btnAddCheckpoint.addEventListener("click", () => createEntity("checkpoint"));

function createEntity(type) {
  const area = gameData.areas[selectedAreaIndex];

  let entity;

  if (type === "npc") {
    entity = {
      id: crypto.randomUUID(),
      type: "npc",
      name: "New NPC",
      role: "Villager",
      mood: "Neutral",
      dialogue: "Hello, traveler.",
      givesQuest: false,
      image: null
    };
  }

  if (type === "enemy") {
    entity = {
      id: crypto.randomUUID(),
      type: "enemy",
      name: "New Enemy",
      hp: 20,
      stamina: 10,
      damage: 5,
      poise: 5,
      aiStyle: "Aggressive",
      loot: "Gold",
      image: null
    };
  }

  if (type === "checkpoint") {
    entity = {
      id: crypto.randomUUID(),
      type: "checkpoint",
      name: "Checkpoint",
      healsPlayer: true,
      restoresMana: true,
      respawnHere: true,
    image: null
    };
  }

  area.entities.push(entity);
  saveGameData(gameData);

  renderEntitiesList();
  selectEntity(area.entities.length - 1);
}

function renderEntitiesList() {
  entitiesList.innerHTML = "";

  const area = gameData.areas[selectedAreaIndex];

  area.entities.forEach((entity, index) => {
    const card = document.createElement("div");
    card.className = "entity-card" + (index === selectedEntityIndex ? " active" : "");
    if (entity.image) {
    const thumb = document.createElement("div");
    thumb.className = "entity-thumb";
    thumb.style.backgroundImage = `url(${entity.image})`;
    card.appendChild(thumb);
    }


    const title = document.createElement("h4");
    title.textContent = `${entity.type.toUpperCase()} — ${entity.name}`;

    const desc = document.createElement("p");

    if (entity.type === "npc") desc.textContent = `Mood: ${entity.mood}`;
    if (entity.type === "enemy") desc.textContent = `HP: ${entity.hp}  DMG: ${entity.damage}`;
    if (entity.type === "checkpoint") desc.textContent = `Respawn point`;

    const info = document.createElement("div");
    info.appendChild(title);
    info.appendChild(desc);

    const controls = document.createElement("div");
    controls.className = "entity-controls";

    const up = document.createElement("button");
    up.textContent = "↑";
    up.onclick = () => moveEntity(index, -1);

    const down = document.createElement("button");
    down.textContent = "↓";
    down.onclick = () => moveEntity(index, 1);

    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = () => deleteEntity(index);

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    card.appendChild(info);
    card.appendChild(controls);
    card.addEventListener("click", () => selectEntity(index));

    entitiesList.appendChild(card);
  });
}

function selectEntity(index) {
  selectedEntityIndex = index;
  renderEntitiesList();
  renderEntityEditor();
}

function moveEntity(index, dir) {
  const area = gameData.areas[selectedAreaIndex];
  const newIndex = index + dir;

  if (newIndex < 0 || newIndex >= area.entities.length) return;

  const temp = area.entities[index];
  area.entities[index] = area.entities[newIndex];
  area.entities[newIndex] = temp;

  selectedEntityIndex = newIndex;
  saveGameData(gameData);
  renderEntitiesList();
}

function deleteEntity(index) {
  const area = gameData.areas[selectedAreaIndex];

  if (!confirm("Delete this entity?")) return;

  area.entities.splice(index, 1);
  selectedEntityIndex = null;

  saveGameData(gameData);
  renderEntitiesList();
  renderEntityEditor();
}

/* ---------------- Entity Editor ---------------- */

function renderEntityEditor() {
  entityEditor.innerHTML = "";

  if (selectedEntityIndex === null) {
    entityEditor.classList.add("hidden");
    return;
  }

  entityEditor.classList.remove("hidden");

  const area = gameData.areas[selectedAreaIndex];
  const entity = area.entities[selectedEntityIndex];

  const title = document.createElement("h3");
  title.textContent = `Edit ${entity.type.toUpperCase()}`;
  entityEditor.appendChild(title);

  addField("Name", entity.name, (v) => entity.name = v);

  if (entity.type === "npc") {
    addField("Role", entity.role, (v) => entity.role = v);
    addField("Mood", entity.mood, (v) => entity.mood = v);
    addTextarea("Dialogue", entity.dialogue, (v) => entity.dialogue = v);
    addCheckbox("Gives Quest", entity.givesQuest, (v) => entity.givesQuest = v);
    addImageField("Portrait / Image", entity.image, (v) => entity.image = v);
  }

  if (entity.type === "enemy") {
    addNumber("HP", entity.hp, (v) => entity.hp = v);
    addNumber("Stamina", entity.stamina, (v) => entity.stamina = v);
    addNumber("Damage", entity.damage, (v) => entity.damage = v);
    addNumber("Poise", entity.poise, (v) => entity.poise = v);
    addField("AI Style", entity.aiStyle, (v) => entity.aiStyle = v);
    addField("Loot", entity.loot, (v) => entity.loot = v);
    addImageField("Portrait / Image", entity.image, (v) => entity.image = v);
  }

  if (entity.type === "checkpoint") {
    addCheckbox("Heals Player", entity.healsPlayer, (v) => entity.healsPlayer = v);
    addCheckbox("Restores Mana", entity.restoresMana, (v) => entity.restoresMana = v);
    addCheckbox("Respawn Here", entity.respawnHere, (v) => entity.respawnHere = v);
    addImageField("Portrait / Image", entity.image, (v) => entity.image = v);
  }

  saveGameData(gameData);
  renderEntitiesList();
}

/* ---------------- Editor Helpers ---------------- */

function addField(label, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = label;

  const input = document.createElement("input");
  input.value = value;

  input.addEventListener("input", () => {
    onChange(input.value);
    saveGameData(gameData);
    renderEntitiesList();
  });

  wrapper.appendChild(span);
  wrapper.appendChild(input);
  entityEditor.appendChild(wrapper);
}

function addTextarea(label, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = label;

  const textarea = document.createElement("textarea");
  textarea.rows = 4;
  textarea.value = value;

  textarea.addEventListener("input", () => {
    onChange(textarea.value);
    saveGameData(gameData);
  });

  wrapper.appendChild(span);
  wrapper.appendChild(textarea);
  entityEditor.appendChild(wrapper);
}

function addNumber(label, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = label;

  const input = document.createElement("input");
  input.type = "number";
  input.value = value;

  input.addEventListener("input", () => {
    onChange(parseInt(input.value) || 0);
    saveGameData(gameData);
    renderEntitiesList();
  });

  wrapper.appendChild(span);
  wrapper.appendChild(input);
  entityEditor.appendChild(wrapper);
}

function addCheckbox(label, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = label;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = value;

  input.addEventListener("change", () => {
    onChange(input.checked);
    saveGameData(gameData);
  });

  wrapper.appendChild(span);
  wrapper.appendChild(input);
  entityEditor.appendChild(wrapper);
}
function addImageField(label, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";

  const span = document.createElement("span");
  span.textContent = label;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  const preview = document.createElement("div");
  preview.className = "entity-image-preview";

  if (value) {
    preview.style.backgroundImage = `url(${value})`;
  }

  input.addEventListener("change", () => {
    if (!input.files.length) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
      preview.style.backgroundImage = `url(${reader.result})`;
      saveGameData(gameData);
      renderEntitiesList();
    };

    reader.readAsDataURL(input.files[0]);
  });

  wrapper.appendChild(span);
  wrapper.appendChild(input);
  wrapper.appendChild(preview);

  entityEditor.appendChild(wrapper);
}


/* ---------------- Init ---------------- */

// Start on World step
stepWorld.classList.remove("hidden");
stepAreas.classList.add("hidden");
stepEntities.classList.add("hidden");

loadWorldIntoForm();
