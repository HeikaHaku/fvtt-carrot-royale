/**
 * @extends {ItemSheet}
 */

export class EnchantmentSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'enchantment-sheet'],
      template: 'systems/carrot-royale/templates/item/enchantment-sheet.html',
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
