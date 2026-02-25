(async () => {
  const version = game.version; // The FVTT Version
  const system = `${game.system.id} (v${game.system.version})`;

  // Filter for only active modules
  const activeModules = game.modules
    .filter((m) => m.active)
    .map((m) => `<li><b>${m.title}</b> (v${m.version})</li>`)
    .join("");

  const report = `
        <div class="osric-chat-card" style="font-family: serif;">
            <h3>System Audit</h3>
            <hr>
            <p><b>Foundry VTT:</b> v${version}</p>
            <p><b>System:</b> ${system}</p>
            <p><b>Active Modules:</b></p>
            <ul>${activeModules}</ul>
        </div>
    `;

  ChatMessage.create({
    content: report,
    whisper: [game.user.id], // Whispers only to you
  });
})();
