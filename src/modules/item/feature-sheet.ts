/**
 * @extends {ItemSheet}
 */

export class FeatureSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'feature-sheet'],
      template: 'systems/carrot-royale/templates/item/feature-sheet.html',
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
