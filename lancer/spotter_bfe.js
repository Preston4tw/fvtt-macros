/* A macro for Spotter's Bentham/Foucault Elimination system.
   Just creates a chat message describing the effect.

   Lancer Core Book pg. 101
*/

const target = Array.from(game.user.targets)[0];
if (!target) return ui.notifications.error("No target selected.");

const name = target.name;

const html = `
<h3>Bentham/Foucault Elimination</h3>
<p>${name} may make any quick action as a reaction, consuming Lock On.</p>
`;

ChatMessage.create({
  user: game.user.id,
  content: html,
});
