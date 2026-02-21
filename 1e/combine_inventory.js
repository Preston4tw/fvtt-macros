/**
 * 1E Macro to combine identical items and currency in an inventory.
 * Has Dry-Run mode to report changes without making them.
 * Filters for Owned Actors.
 */

const ownedActors = game.actors
  .filter((a) => a.isOwner && a.type === "character")
  .map((a) => `<option value="${a.id}">${a.name}</option>`)
  .join("");

if (ownedActors.length === 0) {
  ui.notifications.error("No owned characters or stashes found.");
} else {
  const dialogContent = `
        <form>
            <div class="form-group">
                <label>Target Actor:</label>
                <select id="target-id">${ownedActors}</select>
            </div>
            <hr>
            <div class="form-group">
                <label>Dry Run (Report Only):</label>
                <input type="checkbox" id="dry-run" checked>
            </div>
            <p><small><i>Dry Run will whisper the result to you without changing inventory.</i></small></p>
        </form>`;

  new Dialog({
    title: "Combine Inventory",
    content: dialogContent,
    buttons: {
      execute: {
        label: "Run",
        callback: async (html) => {
          const actorId = html.find("#target-id").val();
          const isDryRun = html.find("#dry-run").is(":checked");
          const actor = game.actors.get(actorId);

          // 1. Filter tangible types
          const tangibleTypes = [
            "item",
            "gear",
            "weapon",
            "armor",
            "loot",
            "equipment",
          ];
          const items = actor.items.contents.filter((i) =>
            tangibleTypes.includes(i.type),
          );

          // May need to be expanded
          const currencyNames = {
            "Electrum Coins": ["Electrum Coins"],
            "Silver Coins": ["Silver Coins"],
            "Gold Coin": ["Gold Coin", "Gold Coins"],
          };

          const groups = new Map();

          // 2. Map items by Name + Weight
          for (const item of items) {
            let key = item.name;
            let finalName = item.name;
            for (const [pref, aliases] of Object.entries(currencyNames)) {
              if (aliases.includes(item.name)) {
                key = `CURR_${pref}`;
                finalName = pref;
                break;
              }
            }
            if (!key.startsWith("CURR_"))
              key = `${item.name}_${item.system.weight || 0}`.toLowerCase();

            if (!groups.has(key))
              groups.set(key, {
                master: item,
                duplicates: [],
                finalName,
                totalQty: 0,
              });
            const data = groups.get(key);
            data.totalQty += item.system.quantity || 1;
            if (item.id !== data.master.id) data.duplicates.push(item.id);
          }

          // 3. Prepare Updates
          let updateData = [];
          let deleteIds = [];
          let report = `<b>${isDryRun ? "DRY RUN" : "LIVE"} REPORT: ${actor.name}</b><br>`;
          let changesMade = false;

          for (const [key, data] of groups) {
            if (data.duplicates.length > 0) {
              changesMade = true;
              updateData.push({
                _id: data.master.id,
                name: data.finalName,
                "system.quantity": data.totalQty,
              });
              deleteIds.push(...data.duplicates);
              report += `• Combine ${data.duplicates.length + 1} stacks of ${data.finalName} (Total: ${data.totalQty})<br>`;
            }
          }

          if (!changesMade) {
            return ui.notifications.info(
              `${actor.name} is already consolidated.`,
            );
          }

          // 4. Execution or Whisper
          if (isDryRun) {
            ChatMessage.create({
              user: game.user._id,
              content:
                report + "<br><i>No changes were made to the database.</i>",
              whisper: [game.user._id],
            });
            ui.notifications.info("Dry run complete. Check chat for report.");
          } else {
            // Console Backup before Live change
            console.warn(
              `LIVE CONSOLIDATION BACKUP [${actor.name}]:`,
              JSON.stringify(actor.toJSON().items),
            );

            await actor.updateEmbeddedDocuments("Item", updateData);
            await actor.deleteEmbeddedDocuments("Item", deleteIds);

            ChatMessage.create({
              user: game.user._id,
              content: report + "<br><b>LIVE CHANGES APPLIED.</b>",
              whisper: [game.user._id],
            });
            ui.notifications.info(`Consolidation of ${actor.name} complete.`);
          }
        },
      },
    },
  }).render(true);
}
