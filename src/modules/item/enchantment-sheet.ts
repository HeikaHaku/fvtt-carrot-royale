/**
 * @extends {ItemSheet}
 */

export class EnchantmentSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'enchantment'],
      template: 'systems/carrot-royale/templates/item/enchantment-sheet.html',
      width: 560,
      height: 400,
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
