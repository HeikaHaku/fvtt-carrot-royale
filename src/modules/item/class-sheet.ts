/**
 * @extends {ItemSheet}
 */

export class ClassSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'class-sheet'],
      template: 'systems/carrot-royale/templates/item/class-sheet.html',
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
