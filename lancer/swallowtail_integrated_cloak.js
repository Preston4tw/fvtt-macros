/* A macro for Swallowtail's Integrated Cloak system, applying the Invisible
   status.

   Lancer Core Book pg. 184
*/
(async () => {
  const statusLabel = "Invisible";
  const statusIcon = "systems/lancer/assets/icons/white/status_invisible.svg";

  const target =
    Array.from(game.user.targets)[0] || canvas.tokens.controlled[0];
  if (!target)
    return ui.notifications.error("Integrated Cloak: No token selected.");

  const actor = target.actor;
  const header = `Swallowtail: Integrated Cloak ➔ ${target.name}`;
  const body =
    "at end of turn, become invisible if not moved this turn. lasts until start of next turn (1 round).";

  const existingEffect = actor.effects.find(
    (e) => e.icon === statusIcon || e.name === statusLabel,
  );

  if (existingEffect) {
    await existingEffect.delete();
  } else {
    const cRound = game.combat?.round || 0;
    const cTurn = game.combat?.turn || 0;

    await actor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: statusLabel,
        icon: statusIcon,
        origin: actor.uuid,
        // Explicitly defining every key to override system defaults
        duration: {
          startTime: game.time.worldTime,
          seconds: null,
          combat: game.combat?.id || null,
          rounds: 1,
          turns: 0,
          startRound: cRound,
          startTurn: cTurn,
        },
        flags: { core: { statusId: "invisible" } },
      },
    ]);
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: `<b>${header}</b><hr>${body}`,
  });
})();
