/**
 * @extends {ActorSheet}
 */

export class HeroSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'actor', 'sheet', 'hero'],
      template: 'systems/carrot-royale/templates/actor/hero-sheet.html',
      width: 700,
      height: 625,
      tabs: [
        {
          navSelector: '.sheet-navigation',
          contentSelector: '.sheet-body',
          initial: 'attributes',
        },
      ],
    });
  }
}
