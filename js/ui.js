/**
 * @param {Element} el
 * @returns {void}
 */
export function clearElement(el) {
  el.innerHTML = "";
}

/**
 * @param {string} text
 * @param {string} className
 * @param {() => void} onClick
 * @returns {HTMLButtonElement}
 */
export function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

/**
 * @param {string} className
 * @param {string} text
 * @returns {HTMLDivElement}
 */
export function createTextBlock(className, text) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  return div;
}

/**
 * @param {number} current
 * @param {number} max
 * @returns {HTMLDivElement}
 */
export function createHPBar(current, max) {
  const bar = document.createElement("div");
  bar.className = "hp-bar";

  const fill = document.createElement("div");
  fill.className = "hp-fill";
  fill.style.width = `${(current / max) * 100}%`;

  bar.appendChild(fill);
  return bar;
}
