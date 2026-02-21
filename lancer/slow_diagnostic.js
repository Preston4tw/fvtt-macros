// debug macro for checking the slow condition
(async () => {
  const token = canvas.tokens.controlled[0];
  if (!token) return ui.notifications.error("Select your token first.");

  const actor = token.actor;
  const targetIcon = "systems/lancer/assets/icons/white/condition_slow.svg";
  const targetLabel = "Slowed";

  let report = `<h2>Diagnostic: Slowed Condition Check</h2>`;
  report += `<b>Actor:</b> ${actor.name}<br><hr>`;

  // Scan all effects for a match on name, label, or icon path
  const slowedEffect = actor.effects.find(
    (e) =>
      e.name === targetLabel ||
      e.label === targetLabel ||
      e.icon === targetIcon,
  );

  if (slowedEffect) {
    // Inspecting the raw data object for system keys
    const data = slowedEffect.toObject();

    report += `<p style="color: green;">✔ <b>Found:</b> "${slowedEffect.name || slowedEffect.label}"</p>`;
    report += `<ul>
            <li><b>Path:</b> <code>${slowedEffect.icon}</code></li>
            <li><b>StatusID:</b> <code>${slowedEffect.getFlag("core", "statusId") || "None"}</code></li>
            <li><b>Lancer Type:</b> <code>${slowedEffect.getFlag("lancer", "type") || "None"}</code></li>
        </ul>`;

    report += `<b>Duration Data:</b><br><pre>${JSON.stringify(data.duration, null, 2)}</pre>`;
  } else {
    report += `<p style="color: red;">✘ <b>Not Found:</b> No effect matches "Slowed" or the provided icon path.</p>`;

    // List everything currently on the actor to see what IS there
    report += `<hr><b>Current Effects on Actor:</b><ul>`;
    actor.effects.forEach((e) => {
      report += `<li>${e.name || e.label} (<code>${e.icon}</code>)</li>`;
    });
    report += `</ul>`;
  }

  ChatMessage.create({
    content: report,
    whisper: [game.user.id],
  });
})();
