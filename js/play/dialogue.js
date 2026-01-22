import { clearElement, createButton, createTextBlock } from "./ui.js";

/**
 * @param {object} params
 * @param {HTMLElement} params.playBody
 * @param {HTMLElement} params.playFooter
 * @param {() => void} params.onAdvance
 * @returns {{ showNPC: (npc: any) => void }}
 */
export function createDialogueController({ playBody, playFooter, onAdvance }) {
  function showNPC(npc) {
    const dialogueLines = Array.isArray(npc.dialogueLines)
      ? npc.dialogueLines
      : [npc.dialogue || ""];
    let lineIndex = 0;

    const renderLine = () => {
      clearElement(playBody);
      clearElement(playFooter);

      playBody.appendChild(createTextBlock("dialogue-name", npc.name));
      playBody.appendChild(createTextBlock("dialogue-text", dialogueLines[lineIndex] || ""));

      const btn = createButton("Continue", "btn btn-primary", () => {
        lineIndex += 1;
        if (lineIndex >= dialogueLines.length) {
          onAdvance();
          return;
        }
        renderLine();
      });

      playFooter.appendChild(btn);
    };

    renderLine();
  }

  return { showNPC };
}
