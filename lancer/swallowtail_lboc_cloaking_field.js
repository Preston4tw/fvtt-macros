// work in progress
// reference:
// https://fantasycomputer.works/FoundryVTT-Sequencer/#/api/effect
/* .locally() or .locally(bool)
Causes effect to be played only locally, and not push to other connected clients.
*/
/* Liked these effects, skimming through jb2a
  jb2a.energy_field.01.blue
  jb2a.extras.tmfx
    jb2a.extras.tmfx.outflow.circle.01
    jb2a.extras.tmfx.border.circle.simple.01
  jb2a.fog_cloud
  jb2a.markers.bubble.loop
  jb2a.shield.01.loop
*/
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
      .scaleToObject(burstSize, { uniform: false, considerTokenScale: false}) // defaults false,false, play with it and see if changing options does anything we like
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

/*
// how to do a circle
new Sequence()
    .effect()
        .attachTo(token)
        .persist()
        .shape("circle", {
            lineSize: 4,
            lineColor: "#FF0000",
            radius: 1.5,
            gridUnits: true,
            name: "test"
        })
        .loopProperty("shapes.test", "scale.x", { from: 0.9, to: 1.1, duration: 1000, pingPong: true, ease: "easeInOutSine" })
        .loopProperty("shapes.test", "scale.y", { from: 0.9, to: 1.1, duration: 1000, pingPong: true, ease: "easeInOutSine" })
    .play()
*/