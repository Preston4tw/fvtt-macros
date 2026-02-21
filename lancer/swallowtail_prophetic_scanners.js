/* A macro for Swallowtail's Prophetic Scanners system, applying Lock On and
   Shredded with 1/Round logic. Requires 'csm-lancer-qol' module for effect
   application.

   Lancer Core Book pg. 184
*/
(async () => {
  const token = canvas.tokens.controlled[0];
  const targets = Array.from(game.user.targets);

  if (!token || targets.length === 0) {
    return ui.notifications.error(
      "Prophetic Scanners: Target an enemy and control your mech.",
    );
  }

  const actor = token.actor;
  const target = targets[0];
  const currentRound = game.combat?.round || 0;

  // 1/Round Tracking
  const lastUsedRound = actor.getFlag("world", "propheticScannersRound");
  const canShred = lastUsedRound !== currentRound;

  // Module Bridge
  const pushEffect =
    game.modules.get("csm-lancer-qol")?.exposed?.pushEffectByPlayer;
  if (!pushEffect)
    return ui.notifications.error("Module 'csm-lancer-qol' API not found.");

  const header = `Swallowtail: Prophetic Scanners ➔ ${target.name}`;
  const body =
    "1/r Shred target while inflicting Lock On until the end of its next turn.";

  // 1. Always apply Lock On
  pushEffect("lockon", targets);

  // 2. Apply Shredded (1/Round logic)
  let cooldownNote = "";
  if (canShred) {
    pushEffect("shredded", targets);
    await actor.setFlag("world", "propheticScannersRound", currentRound);
  } else {
    ui.notifications.warn(
      "Prophetic Scanners: Shredded already used this round.",
    );
    cooldownNote = `<br><i style="color: grey;">(Lock On applied; Shredded already used this round)</i>`;
  }

  // Chat Output
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: `<b>${header}</b><hr>${body}${cooldownNote}`,
  });
})();
