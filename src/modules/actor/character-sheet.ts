/**
 * @format
 * @extends {ActorSheet}
 */

export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'character-sheet'],
      template: 'systems/fvtt-carrot-royal/templates/character-sheet.html',
      width: 600,
      height: 400,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'stats',
        },
      ],
    });
  }
}
