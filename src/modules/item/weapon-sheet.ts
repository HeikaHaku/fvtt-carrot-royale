/**
 * @extends {ItemSheet}
 */

export class WeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'weapon'],
      template: 'systems/carrot-royale/templates/item/weapon-sheet.html',
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
