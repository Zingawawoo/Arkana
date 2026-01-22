import {
  advanceArea,
  advanceEntity,
  getCurrentArea,
  getCurrentAreaIndex,
  getCurrentEntity,
  getCurrentEntityIndex,
  getGameData,
  setCurrentEntityIndex,
  resetPlayerHP
} from "../data.js";
import { renderCheckpoint, renderEndScreen, transitionEntity } from "./ui.js";

/**
 * @param {object} params
 * @param {HTMLElement} params.areaTitle
 * @param {HTMLElement} params.areaDescription
 * @param {HTMLElement} params.playBackground
 * @param {HTMLElement} params.playBody
 * @param {HTMLElement} params.playFooter
 * @param {() => void} params.onReturnHome
 * @returns {{
 *  gameData: any,
 *  init: () => void,
 *  loadEntity: () => void,
 *  advanceAndLoadEntity: () => void,
 *  setRenderers: (renderers: { showNPC: (npc: any) => void, showEnemy: (enemy: any) => void }) => void
 * }}
 */
export function createPlayEngine({
  areaTitle,
  areaDescription,
  playBackground,
  playBody,
  playFooter,
  onReturnHome
}) {
  const gameData = getGameData();
  let hasRenderedEntity = false;
  let renderers = null;

  function setRenderers(nextRenderers) {
    renderers = nextRenderers;
  }

  function loadArea() {
    if (getCurrentAreaIndex() >= gameData.areas.length) {
      renderEndScreen(playBody, playFooter, onReturnHome);
      return;
    }

    const area = getCurrentArea();

    areaTitle.textContent = area.name || "Unknown Area";
    areaDescription.textContent = area.description || "";

    if (area.backgroundImage) {
      playBackground.style.backgroundImage = `url(${area.backgroundImage})`;
    }

    setCurrentEntityIndex(0);
    loadEntity();
  }

  function advanceAndLoadEntity() {
    advanceEntity();
    loadEntity();
  }

  function loadEntity() {
    const area = getCurrentArea();

    // No more entities -> next area
    if (getCurrentEntityIndex() >= area.entities.length) {
      advanceArea();
      loadArea();
      return;
    }

    const entity = getCurrentEntity();
    const renderEntity = () => {
      if (entity.type === "npc") renderers.showNPC(entity);
      if (entity.type === "enemy") renderers.showEnemy(entity);
      if (entity.type === "checkpoint") {
        if (entity.healsPlayer) resetPlayerHP();
        renderCheckpoint(playBody, playFooter, advanceAndLoadEntity);
      }
    };

    if (!hasRenderedEntity) {
      hasRenderedEntity = true;
      renderEntity();
      return;
    }

    transitionEntity(playBody, playFooter, renderEntity);
  }

  function init() {
    loadArea();
  }

  return {
    gameData,
    init,
    loadEntity,
    advanceAndLoadEntity,
    setRenderers
  };
}
