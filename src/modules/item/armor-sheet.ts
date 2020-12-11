/**
 * @extends {ItemSheet}
 */

export class ArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'armor'],
      template: 'systems/carrot-royale/templates/item/armor-sheet.html',
      width: 500,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-navigation',
          contentSelector: '.sheet-body',
          initial: 'details',
        },
      ],
    });
  }
}
