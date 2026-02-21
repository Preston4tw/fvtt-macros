/* A macro for Swallowtail's Retractable Profile system, applying both the
   profile and slowed effects. Toggling the macro will remove both effects.

   Lancer Core Book pg. 184
*/
(async () => {
  const actor = canvas.tokens.controlled[0]?.actor;
  if (!actor) return ui.notifications.error("Select your token first.");

  const profileName = "Retractable Profile";
  const slowName = "Slowed";
  const slowIcon = "systems/lancer/assets/icons/white/condition_slow.svg";

  // Check for existing profile to determine toggle state
  const existingProfile = actor.effects.find((e) => e.name === profileName);

  let chatHeader, chatBody, actionType;

  if (existingProfile) {
    // Deactivation: Find and delete BOTH effects
    const effectsToDelete = actor.effects
      .filter((e) => e.name === profileName || e.name === slowName)
      .map((e) => e.id);

    if (effectsToDelete.length > 0) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToDelete);
    }

    chatHeader = "Retractable Profile: Deactivated";
    chatBody = "The Swallowtail extends its frame to full height.";
    actionType = "Quick Action";
  } else {
    // Activation: Create both effects as separate documents
    const effectData = [
      {
        name: profileName,
        icon: "icon/skills/social/peace-luck-insult.webp",
        origin: actor.uuid,
        changes: [
          {
            key: "system.accuracy",
            mode: 2,
            value: "-1",
            priority: 20,
          },
        ],
      },
      {
        name: slowName,
        icon: slowIcon,
        origin: actor.uuid,
        description: "The only movement SLOWED characters can make is their standard move, on their own turn – they can’t BOOST or make any special moves granted by talents, systems, or weapons.",
        statuses: ["slow"],
      },
    ];

    await actor.createEmbeddedDocuments("ActiveEffect", effectData);

    chatHeader = "Retractable Profile: Activated";
    chatBody =
      "The Swallowtail collapses its chassis, becoming a smaller target.";
    actionType = "Protocol";
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: `
            <div class="lancer-chat-card">
                <b style="font-size: 1.1em;">${chatHeader}</b>
                <hr>
                <p>${chatBody}</p>
                <div style="background: rgba(0,0,0,0.1); padding: 5px; border-radius: 3px; border: 1px solid #777;">
                    <b>Action Cost:</b> ${actionType}<br>
                    <b>Status:</b> ${existingProfile ? "Standard Profile." : "Slowed & Profile Active."}
                </div>
            </div>`,
  });
})();
