/**
 * The Combat Entity defines a particular combat encounter which can occur within the game session
 * Combat instances belong to the CombatEncounters collection
 */
declare class Combat extends Entity {
  _getInitiativeFormula(combatant): string | Promise<string>;
}
