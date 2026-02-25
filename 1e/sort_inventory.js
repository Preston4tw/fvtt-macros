/**
 * OSRIC/ARS Inventory Sorter
 * Hierarchy: Characters (A-Z) -> Lootables (A-Z)
 * Fix: Explicitly includes 'potion', 'magic', 'scroll', 'wand' types.
 */

(async () => {
  // 1. Hierarchical Actor Selection
  let actorTargets = game.actors.filter(
    (a) => ["character", "lootable"].includes(a.type) && a.isOwner,
  );

  if (actorTargets.length === 0)
    return ui.notifications.warn("No owned characters or stashes found.");

  // Hierarchical Sort for Dropdown
  actorTargets.sort((a, b) => {
    if (a.type !== b.type) return a.type === "character" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const options = actorTargets
    .map((a) => `<option value="${a.id}">${a.name} (${a.type})</option>`)
    .join("");

  new Dialog({
    title: "Inventory Sorter",
    content: `<form><div class="form-group"><label>Target:</label><select id="actor-id" style="width: 100%">${options}</select></div></form>`,
    buttons: {
      sort: {
        icon: '<i class="fas fa-box-open"></i>',
        label: "Sort Inventory Only",
        callback: async (html) => {
          const actor = game.actors.get(html.find("#actor-id").val());
          await performInventoryOnlySort(actor);
        },
      },
    },
    default: "sort",
  }).render(true);
})();

async function performInventoryOnlySort(actor) {
  // TACTICAL FIX: Added 'potion', 'magic', 'scroll', 'wand' for ARS system support
  const validTypes = [
    "item",
    "gear",
    "currency",
    "treasure",
    "loot",
    "equipment",
    "weapon",
    "armor",
    "container",
    "potion",
    "magic",
    "scroll",
    "wand",
  ];
  const currencyRegex =
    /\b(gold|silver|electrum|platinum|copper|coin|coins)\b/i;

  const items = actor.items.contents
    .filter((i) => validTypes.includes(i.type))
    .map((i) => {
      // Remove non-ASCII (arrows) to ensure "▶ Potion" sorts under "P"
      const cleanName = i.name.replace(/[^\x00-\x7F]/g, "").trim();
      return {
        id: i.id,
        name: cleanName.toLowerCase(),
        isCurrency: currencyRegex.test(cleanName),
      };
    });

  items.sort((a, b) => {
    // Priority 1: Currency
    if (a.isCurrency && !b.isCurrency) return -1;
    if (!a.isCurrency && b.isCurrency) return 1;
    // Priority 2: Alphabetical
    return a.name.localeCompare(b.name);
  });

  // Re-index at 10,000 to keep them separated from Class/Race/Skill data
  const sortUpdates = items.map((item, index) => ({
    _id: item.id,
    sort: 10000 + index * 100,
  }));

  await actor.updateEmbeddedDocuments("Item", sortUpdates);
  ui.notifications.info(
    `Sorted inventory for ${actor.name}. Potions and specialized types now included.`,
  );
}
