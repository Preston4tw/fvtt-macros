/**
 * Should be replaced by combine_inventory.js, but left here for reference.
 * OSRIC/Foundry VTT Party Stash Dry-Run Consolidator
 * Target: "Party Stash" or "Lootable: Party Stash"
 * Performs a dry run (whisper only) of combining identical items and currency.
 */

(async () => {
    // 1. Identify the Stash Actor
    const stashNames = ["Party Stash", "Lootable: Party Stash"];
    const stash = game.actors.find(a => stashNames.includes(a.name));

    if (!stash) {
        ui.notifications.error("Stash actor not found. Ensure 'Party Stash' exists in the Sidebar.");
        return;
    }

    const items = stash.items.contents;
    const consolidationMap = new Map();
    const currencyNames = {
        "Electrum Coins": ["Electrum Coins"],
        "Silver Coins": ["Silver Coins"],
        "Gold Coin": ["Gold Coin", "Gold Coins"]
    };

    // 2. Logic to group items
    for (const item of items) {
        let key = "";
        let finalName = item.name;

        // Handle Currency logic specifically
        let isCurrency = false;
        for (const [preferred, aliases] of Object.entries(currencyNames)) {
            if (aliases.includes(item.name)) {
                key = `CURRENCY_${preferred}`;
                finalName = preferred;
                isCurrency = true;
                break;
            }
        }

        // Handle generic items by Name + Weight
        if (!isCurrency) {
            const weight = item.system.weight || 0;
            key = `${item.name}_${weight}`.toLowerCase().replace(/\s+/g, '');
        }

        const qty = item.system.quantity || 1;

        if (consolidationMap.has(key)) {
            const entry = consolidationMap.get(key);
            entry.totalQty += qty;
            entry.count++;
            entry.ids.push(item.id);
        } else {
            consolidationMap.set(key, {
                originalName: item.name,
                finalName: finalName,
                totalQty: qty,
                count: 1,
                ids: [item.id]
            });
        }
    }

    // 3. Generate Dry Run Report
    let report = `<b>DRY RUN: Consolidation for ${stash.name}</b><br><br>`;
    let changesFound = false;

    for (const [key, data] of consolidationMap) {
        if (data.count > 1) {
            changesFound = true;
            report += `• <b>${data.finalName}</b>: Combine ${data.count} stacks into one (Total: ${data.totalQty})<br>`;
        }
    }

    if (!changesFound) {
        report += "No duplicates found. Inventory is already optimized.";
    }

    // 4. Output as Self-Whisper
    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: stash }),
        content: report,
        whisper: [game.user._id]
    });

})();