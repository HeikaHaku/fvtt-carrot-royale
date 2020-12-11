/**
 * @extends {ItemSheet}
 */

export class MagicItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'magic-item'],
      template: 'systems/carrot-royale/templates/item/magic-item-sheet.html',
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
