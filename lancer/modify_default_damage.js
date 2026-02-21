// From the Lancer sub-channel in the FVTT Discord, courtesy of Emmi.
// AFAICT this macro modifies the standard damage roll dialog
// allowing you to modify the defaults to what you need.
// These can be freely modified to get the behavior you want.
const CONFIG = {
  title: "Damage Roll", // Title displayed in the damage roll dialog
  // These are booleans (true/false)
  ap: false,
  paracausal: false, // Damage cannot be Reduced
  half_damage: false,
  overkill: false,
  reliable: false,

  // Define damage types and values here.
  // Options are: Kinetic, Energy, Explosive, Burn and Heat
  damage: [
    { type: "Kinetic", val: "1d6" },
    // Multiple types require commas at the end:
    // { type: "Energy", val: "2d6+2" },
    // { type: "Burn", val: "1" }
  ],

  // Format is the same as above.
  bonus_damage: [
    // { type: "Kinetic", val: "1d6" }
  ],
};

// Don't touch this.
const flow = new (game.lancer.flows.get("DamageRollFlow"))(token.actor, CONFIG);
await flow.begin();
