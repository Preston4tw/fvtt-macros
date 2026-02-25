/**
 * ARS/OSRIC Hardened Consolidator v8
 * Hierarchical Sort + Sub-Item Precision + Magic Awareness
 */

(async () => {
  let actorTargets = game.actors.filter(
    (a) => ["character", "lootable"].includes(a.type) && a.isOwner,
  );

  if (actorTargets.length === 0)
    return ui.notifications.warn("No owned characters or stashes found.");

  // Hierarchical Sort: Characters A-Z, then Lootables A-Z
  actorTargets.sort((a, b) => {
    if (a.type !== b.type) return a.type === "character" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const options = actorTargets
    .map((a) => `<option value="${a.id}">${a.name} (${a.type})</option>`)
    .join("");

  new Dialog({
    title: "Inventory Management: Final Pathing",
    content: `
            <form>
                <div class="form-group"><label>Target:</label><select id="actor-id" style="width: 100%">${options}</select></div>
                <div class="form-group"><label>Dry Run:</label><input type="checkbox" id="dry-run" checked></div>
                <hr><p><small><b>Logic:</b> Eliminates all weightless sub-items and merges physical goods by Name + Weight + Magic Bonus.</small></p>
            </form>`,
    buttons: {
      execute: {
        icon: '<i class="fas fa-boxes"></i>',
        label: "Execute",
        callback: async (html) => {
          const actor = game.actors.get(html.find("#actor-id").val());
          const isDryRun = html.find("#dry-run").is(":checked");
          await performPrecisionClean(actor, isDryRun);
        },
      },
    },
    default: "execute",
  }).render(true);
})();

async function performPrecisionClean(actor, isDryRun) {
  const validTypes = [
    "item",
    "gear",
    "currency",
    "treasure",
    "loot",
    "equipment",
    "weapon",
    "armor",
  ];

  // Process ALL items to find children/parents
  const allItems = actor.items.contents;
  const physicalGroups = new Map();
  const subItemIds = [];
  const currencyNames = [
    "gold coin",
    "silver coin",
    "electrum coin",
    "copper coin",
    "platinum coin",
  ];

  for (const item of allItems) {
    if (!validTypes.includes(item.type)) continue;

    const weight = Number(item.system.weight ?? 0);
    const isMagic = item.system.attributes?.magic || false;
    const magicBonus = item.system.attack?.magicBonus || 0;

    // TACTICAL FIX: Check if item is a child or a system action stub (wt 0)
    const isSubItem = actor.items.some((parent) =>
      parent.system.itemList?.some((child) => child.id === item.id),
    );

    if (isSubItem || (weight === 0 && item.type === "weapon")) {
      subItemIds.push(item.id);
      continue;
    }

    // Name Normalization
    let cleanName = item.name.replace(/[^\x00-\x7F]/g, "").trim();
    for (const c of currencyNames) {
      if (cleanName.toLowerCase().includes(c)) {
        cleanName =
          c
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ") + "s";
        break;
      }
    }

    // Key: Name + Weight + Magic Bonus (Prevents Dagger merging with Dagger +1)
    const key = `${cleanName.toLowerCase()}_${weight}_${magicBonus}`;
    if (!physicalGroups.has(key)) {
      physicalGroups.set(key, {
        master: item,
        name: cleanName,
        totalQty: 0,
        duplicates: [],
      });
    }

    const group = physicalGroups.get(key);
    group.totalQty += Number(item.system.quantity ?? 1);
    if (item.id !== group.master.id) group.duplicates.push(item.id);
  }

  let updates = [];
  let deletes = [...subItemIds];
  let reportRows = "";

  for (const [key, data] of physicalGroups) {
    if (data.duplicates.length > 0) {
      updates.push({
        _id: data.master.id,
        "system.quantity": data.totalQty,
        name: data.name,
      });
      deletes.push(...data.duplicates);
      reportRows += `<li><b>${data.name}</b>: Merged into stack of ${data.totalQty}</li>`;
    }
  }

  if (updates.length === 0 && subItemIds.length === 0)
    return ui.notifications.info(`${actor.name} is already lean.`);

  const reportContent = `<h3>${isDryRun ? "DRY RUN" : "LIVE"} Precision Clean: ${actor.name}</h3>
                           <p>Physical Merges:</p><ul>${reportRows || "<li>None</li>"}</ul>
                           <p>Virtual Sub-Items Removed: ${subItemIds.length}</p>`;

  if (isDryRun) {
    ChatMessage.create({ content: reportContent, whisper: [game.user.id] });
  } else {
    await actor.updateEmbeddedDocuments("Item", updates);
    await actor.deleteEmbeddedDocuments("Item", deletes);
    ChatMessage.create({
      content: reportContent + "<p><b>Inventory Sanitized.</b></p>",
      whisper: [game.user.id],
    });
    ui.notifications.info(`Sanitized ${actor.name}.`);
  }
}
