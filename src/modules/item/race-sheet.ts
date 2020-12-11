/**
 * @extends {ItemSheet}
 */

export class RaceSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'race'],
      template: 'systems/carrot-royale/templates/item/race-sheet.html',
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
