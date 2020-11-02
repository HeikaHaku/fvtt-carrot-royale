/**
 * @extends {ActorSheet}
 */

export class HeroSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'hero-sheet'],
      template: 'systems/carrot-royale/templates/actor/hero-sheet.html',
      width: 700,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'attributes',
        },
      ],
    });
  }
}
