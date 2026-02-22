// work in progress
// Define the Burst 2 radius. In Lancer, Burst 2 = 2.5 hexes/squares radius.
// Adjust 'scale' based on your grid size; 5.0 usually covers a Burst 2.
const burstSize = 6.5;

if (!token) {
  ui.notifications.warn("No token selected.");
} else {
  // Check if the effect is already running to toggle it off
  if (
    Sequencer.EffectManager.getEffects({
      name: "LBOC-Cloaking-Field",
      object: token,
    }).length > 0
  ) {
    Sequencer.EffectManager.endEffects({
      name: "LBOC-Cloaking-Field",
      object: token,
    });
    // Optional: Remove 'Slowed' condition if using csm-lancer-qol
    // game.lancer.putCondition(token.actor, "slowed", false);
  } else {
    new Sequence()
      .effect()
      .file("jb2a.extras.tmfx.border.circle.simple.01") // Requires JB2A;
      .attachTo(token)
      .name("LBOC-Cloaking-Field")
      .scaleToObject(burstSize)
      .opacity(0.5)
      .persist()
      .fadeIn(500)
      .fadeOut(500)
      .belowTokens()
      .play();
    // Optional: Apply 'Slowed' condition automatically
    // game.lancer.putCondition(token.actor, "slowed", true);
  }
}
