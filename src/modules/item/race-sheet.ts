/**
 * @extends {ItemSheet}
 */

export class RaceSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'item', 'sheet', 'race'],
      template: 'systems/carrot-royale/templates/item/race-sheet.html',
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

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /** @override */
  _getSubmitData(updateData = {}): any {
    // Create the expanded update data object
    const fd = new FormDataExtended(this.form, { editors: this.editors });
    let data = fd.toObject();
    if (updateData) data = mergeObject(data, updateData);
    else data = expandObject(data);

    //Handle Bonuses array
    const bonus = data.data?.bonus;
    if (bonus) bonus.stats = Object.values(bonus?.stats || {}).map((d: any) => [d[0] || '', d[1] || '']);

    // Return the flattened submission data
    return flattenObject(data);
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html: any) {
    super.activateListeners(html);
    if (this.isEditable) {
      html.find('.bonus-control').click(this._onBonusControl.bind(this));
      /*html.find('.trait-selector.class-skills').click(this._onConfigureClassSkills.bind(this));
      html.find('.effect-control').click((ev: any) => {
        if (this.item.isOwned)
          return ui.notifications.warn('Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.');
        onManageActiveEffect(ev, this.item);
      });*/
    }
  }

  /* -------------------------------------------- */

  /**
   * Add or remove a Bonus part from the Racial Bonus
   * @param {Event} event     The original click event
   * @return {Promise}
   * @private
   */
  async _onBonusControl(event: any) {
    event.preventDefault();
    const a = event.currentTarget;

    // Add new damage component
    if (a.classList.contains('add-bonus')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const bonus = this.item.data.data.bonus;
      return this.item.update({ 'data.bonus.stats': bonus.stats.concat([['', '']]) });
    }

    // Remove a damage component
    if (a.classList.contains('delete-bonus')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest('.bonus-part');
      const bonus = duplicate(this.item.data.data.bonus);
      bonus.stats.splice(Number(li.dataset.bonusPart), 1);
      return this.item.update({ 'data.bonus.stats': bonus.stats });
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onSubmit(...args: [Event | JQuery.Event, { updateData?: any; preventClose?: boolean }?]) {
    if (this._tabs[0].active === 'details') this.position.height = 'auto';
    await super._onSubmit(...args);
  }
}
