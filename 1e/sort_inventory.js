/**
 * FVTT 1E player macro to sort inventories: character or stash.
 * Currency is sorted to the top, then everything else alphabetically.
 * Filters for Owned Characters/Stashes.
 */

const ownedActors = game.actors
  .filter((a) => a.isOwner && a.type === "character")
  .map((a) => `<option value="${a.id}">${a.name}</option>`)
  .join("");

if (ownedActors.length === 0) {
  ui.notifications.error("No owned characters or stashes found.");
} else {
  new Dialog({
    title: "Universal Sorter",
    content: `<form><div class="form-group"><label>Target:</label><select id="target-id">${ownedActors}</select></div></form>`,
    buttons: {
      sort: {
        label: "Sort Inventory",
        callback: async (html) => {
          const actor = game.actors.get(html.find("#target-id").val());

          const items = actor.items.contents.map((i) => ({
            id: i.id,
            name: i.name.toLowerCase(),
            isCurrency: [
              "gold",
              "silver",
              "electrum",
              "platinum",
              "copper",
            ].some((c) => i.name.toLowerCase().includes(c)),
          }));

          items.sort((a, b) => {
            if (a.isCurrency && !b.isCurrency) return -1;
            if (!a.isCurrency && b.isCurrency) return 1;
            return a.name.localeCompare(b.name);
          });

          const sortUpdates = items.map((item, index) => ({
            _id: item.id,
            sort: index * 1000,
          }));
          await actor.updateEmbeddedDocuments("Item", sortUpdates);
          ui.notifications.info(`Sorted ${actor.name}.`);
        },
      },
    },
  }).render(true);
}
