/**
 * Should be replaced by combine_inventory.js, but left here for reference.
 * OSRIC/Foundry VTT Inventory Consolidator
 * Consolidates Electrum, Silver, and Gold coins.
 * Specifically merges "Gold Coins" into "Gold Coin" per user preference.
 */

const token = canvas.tokens.controlled[0];

if (!token) {
    ui.notifications.error("No token selected.");
} else {
    const actor = token.actor;
    
    // Configuration: [List of names to find] : "Preferred Name to Keep"
    const consolidationMap = {
        "Electrum Coins": ["Electrum Coins"],
        "Silver Coins": ["Silver Coins"],
        "Gold Coin": ["Gold Coin", "Gold Coins"]
    };

    const processConsolidation = async () => {
        for (const [masterName, searchNames] of Object.entries(consolidationMap)) {
            // Find all items matching any of the names in the search list
            const matches = actor.items.filter(i => searchNames.includes(i.name));

            if (matches.length > 1) {
                let totalQuantity = matches.reduce((acc, i) => acc + (i.system.quantity || 0), 0);
                
                // Identify the "Master" stack: 
                // 1. Prefer an item that already has the exact 'masterName'
                // 2. Fallback to the first match found
                let masterStack = matches.find(i => i.name === masterName) || matches[0];
                
                // Identify all other IDs for deletion
                const deleteIds = matches
                    .filter(i => i.id !== masterStack.id)
                    .map(i => i.id);

                // Update Master (Name and Quantity) and Delete Redundant
                await masterStack.update({ 
                    "name": masterName,
                    "system.quantity": totalQuantity 
                });
                await actor.deleteEmbeddedDocuments("Item", deleteIds);
                
                console.log(`Consolidated ${masterName}: New Total ${totalQuantity}`);
            }
        }
        ui.notifications.info("Currency consolidation complete.");
    };

    processConsolidation();
}