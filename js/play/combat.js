import {
  getPlayerHP,
  getPlayerMana,
  getPlayerStamina,
  resetPlayerHP,
  setPlayerHP,
  setPlayerMana,
  setPlayerStamina
} from "../data.js";
import {
  clearElement,
  createButton,
  createHPBar,
  createTextBlock,
  renderDeath
} from "./ui.js";

/**
 * @param {object} params
 * @param {HTMLElement} params.playBody
 * @param {HTMLElement} params.playFooter
 * @param {() => void} params.onAdvance
 * @param {() => void} params.onRetry
 * @returns {{ showEnemy: (enemy: any) => void }}
 */
export function createCombatController({ playBody, playFooter, onAdvance, onRetry }) {
  function showEnemy(enemy) {
    let enemyHP = enemy.hp;
    let enemyPoise = enemy.poise || 0;
    let enemyTurnCount = 0;
    let enemyGuarding = false;
    let combatLog = "";
    let enemyNameEl = null;
    let enemyBarEl = null;
    const enemyDefense = Number.isFinite(enemy.defense) ? enemy.defense : 0;
    const enemyCritChance = Number.isFinite(enemy.critChance) ? enemy.critChance : 0.1;
    const enemySpecialName = typeof enemy.specialName === "string" ? enemy.specialName.trim() : "";

    const staminaRegen = 2;
    const manaRegen = 1;
    const animMs = 200;

    const swordDamage = 5;
    const swordPoiseDamage = 2;
    const bowCost = 4;
    const bowDamage = 4;
    const wandCost = 5;
    const wandDamage = 6;

    function calculatePlayerDamage(baseDamage) {
      let damage = Math.max(1, baseDamage - enemyDefense);
      if (!enemyGuarding) {
        return damage;
      }
      enemyGuarding = false;
      damage = Math.floor(damage / 2);
      return Math.max(1, damage);
    }

    function triggerElementAnimation(el, className) {
      if (!el) return;
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
      window.setTimeout(() => {
        el.classList.remove(className);
      }, animMs);
    }

    function triggerEnemyHitFeedback() {
      triggerElementAnimation(enemyBarEl, "flash-red");
      triggerElementAnimation(enemyNameEl, "shake");
    }

    function triggerPlayerHitFeedback() {
      triggerElementAnimation(document.body, "screen-hit");
    }

    function regenResources() {
      setPlayerStamina(getPlayerStamina() + staminaRegen);
      setPlayerMana(getPlayerMana() + manaRegen);
    }

    function handleEnemyTurn() {
      combatLog = "";

      if (enemy.aiStyle === "Defensive") {
        if (Math.random() < 0.5) {
          enemyGuarding = true;
          combatLog = "The enemy guards.";
          enemyTurnCount += 1;
          return;
        }
      }

      if (enemy.aiStyle === "Caster") {
        enemyTurnCount += 1;
        if (enemyTurnCount % 2 === 0) {
          setPlayerMana(Math.max(0, getPlayerMana() - enemy.damage));
          combatLog = "The enemy casts a spell.";
          triggerPlayerHitFeedback();
          return;
        }
      } else {
        enemyTurnCount += 1;
      }

      const bonusDamage = enemy.aiStyle === "Aggressive" ? 1 : 0;
      let finalDamage = enemy.damage + bonusDamage;
      if (Math.random() < enemyCritChance) {
        finalDamage *= 2;
      }
      finalDamage = Math.max(1, finalDamage);
      setPlayerHP(getPlayerHP() - finalDamage);
      if (!combatLog && enemySpecialName) {
        combatLog = `Enemy uses ${enemySpecialName}!`;
      }
      triggerPlayerHitFeedback();
    }

    function render() {
      clearElement(playBody);
      clearElement(playFooter);

      const box = document.createElement("div");
      box.className = "combat-box";

      // Enemy HP
      const enemyLabel = createTextBlock("", `Enemy HP: ${enemyHP}`);
      const enemyBar = createHPBar(enemyHP, enemy.hp);

      // Player HP
      const playerLabel = createTextBlock("", `Your HP: ${getPlayerHP()}`);

      box.appendChild(enemyLabel);
      box.appendChild(enemyBar);
      box.appendChild(playerLabel);

      enemyNameEl = createTextBlock("dialogue-name", enemy.name);
      playBody.appendChild(enemyNameEl);
      playBody.appendChild(box);

      if (combatLog) {
        playBody.appendChild(createTextBlock("dialogue-text", combatLog));
      }

      // Buttons
      const btnSword = createButton("Sword Attack", "btn btn-primary", () => {
        enemyHP -= calculatePlayerDamage(swordDamage);
        enemyPoise -= swordPoiseDamage;
        triggerEnemyHitFeedback();

        if (enemyHP > 0) {
          handleEnemyTurn();
          if (getPlayerHP() <= 0) {
            resetPlayerHP();
            renderDeath(playBody, playFooter, onRetry);
            return;
          }
          regenResources();
        }

        if (enemyHP <= 0) {
          onAdvance();
          return;
        }

        render();
      });

      const btnBow = createButton("Bow Shot", "btn btn-primary", () => {
        if (getPlayerStamina() < bowCost) return;

        setPlayerStamina(getPlayerStamina() - bowCost);
        enemyHP -= calculatePlayerDamage(bowDamage);
        triggerEnemyHitFeedback();

        if (enemyHP > 0) {
          handleEnemyTurn();
          if (getPlayerHP() <= 0) {
            resetPlayerHP();
            renderDeath(playBody, playFooter, onRetry);
            return;
          }
          regenResources();
        }

        if (enemyHP <= 0) {
          onAdvance();
          return;
        }

        render();
      });

      const btnWand = createButton("Wand Cast", "btn btn-primary", () => {
        if (getPlayerMana() < wandCost) return;

        setPlayerMana(getPlayerMana() - wandCost);
        enemyHP -= calculatePlayerDamage(wandDamage);
        triggerEnemyHitFeedback();

        if (enemyHP > 0) {
          handleEnemyTurn();
          if (getPlayerHP() <= 0) {
            resetPlayerHP();
            renderDeath(playBody, playFooter, onRetry);
            return;
          }
          regenResources();
        }

        if (enemyHP <= 0) {
          onAdvance();
          return;
        }

        render();
      });

      btnBow.disabled = getPlayerStamina() < bowCost;
      btnWand.disabled = getPlayerMana() < wandCost;

      enemyBarEl = enemyBar;

      playFooter.appendChild(btnSword);
      playFooter.appendChild(btnBow);
      playFooter.appendChild(btnWand);
    }

    render();
  }

  return { showEnemy };
}
