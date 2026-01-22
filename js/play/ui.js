import { clearElement, createButton, createHPBar, createTextBlock } from "../ui.js";

const TRANSITION_MS = 200;

/**
 * @param {HTMLElement} playBody
 * @param {HTMLElement} playFooter
 * @param {() => void} render
 * @returns {void}
 */
export function transitionEntity(playBody, playFooter, render) {
  const elements = [playBody, playFooter];

  elements.forEach((el) => {
    el.classList.remove("fade-in");
    el.classList.add("fade-out");
  });

  window.setTimeout(() => {
    render();

    elements.forEach((el) => {
      el.classList.remove("fade-out");
    });

    window.requestAnimationFrame(() => {
      elements.forEach((el) => el.classList.add("fade-in"));
    });

    window.setTimeout(() => {
      elements.forEach((el) => el.classList.remove("fade-in"));
    }, TRANSITION_MS);
  }, TRANSITION_MS);
}

/**
 * @param {HTMLElement} playBody
 * @param {HTMLElement} playFooter
 * @param {() => void} onContinue
 * @returns {void}
 */
export function renderCheckpoint(playBody, playFooter, onContinue) {
  clearElement(playBody);
  clearElement(playFooter);

  playBody.appendChild(createTextBlock("dialogue-text", "You rest at a checkpoint. Your strength returns."));

  const btn = createButton("Continue", "btn btn-primary", onContinue);
  playFooter.appendChild(btn);
}

/**
 * @param {HTMLElement} playBody
 * @param {HTMLElement} playFooter
 * @param {() => void} onContinue
 * @returns {void}
 */
export function renderDeath(playBody, playFooter, onContinue) {
  clearElement(playBody);
  clearElement(playFooter);

  playBody.appendChild(createTextBlock("dialogue-text", "You were defeated... but you rise again at the last checkpoint."));

  const btn = createButton("Continue", "btn btn-primary", onContinue);
  playFooter.appendChild(btn);
}

/**
 * @param {HTMLElement} playBody
 * @param {HTMLElement} playFooter
 * @param {() => void} onReturnHome
 * @returns {void}
 */
export function renderEndScreen(playBody, playFooter, onReturnHome) {
  clearElement(playBody);
  clearElement(playFooter);

  playBody.appendChild(createTextBlock("dialogue-name", "The End"));
  playBody.appendChild(createTextBlock("dialogue-text", "Your journey through this world is complete."));

  const btn = createButton("Return Home", "btn btn-primary", onReturnHome);
  playFooter.appendChild(btn);
}

export { clearElement, createButton, createHPBar, createTextBlock };
