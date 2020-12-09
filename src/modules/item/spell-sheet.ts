/**
 * @extends {ItemSheet}
 */

export class SpellSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'spell-sheet'],
      template: 'systems/carrot-royale/templates/item/spell-sheet.html',
      width: 500,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'details',
        },
      ],
    });
  }
}
