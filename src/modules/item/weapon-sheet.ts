/**
 * @extends {ItemSheet}
 */

export class WeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'weapon'],
      template: 'systems/carrot-royale/templates/item/weapon-sheet.html',
      width: 560,
      height: 400,
      scrollY: ['.tab.active'],
      tabs: [
        {
          navSelector: '.sheet-navigation',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  getData(): ItemSheet<any, any> {
    const data: any = super.getData();
    data.labels = this.item.labels;
    data.config = CONFIG.CarrotRoyale;
    data.itemType = game.i18n.localize(`ITEM.Type${data.item.type.titleCase()}`);

    data.noDuration = ['none'].includes(data.data.duration.units);
    data.perLevel = data.data.duration.units == 'per';

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(position: any = {}) {
    if (!(this._minimized || position.height)) {
      position.height = this._tabs[0].active === 'details' ? 'auto' : this.options.height;
    }
    return super.setPosition(position);
  }
}
