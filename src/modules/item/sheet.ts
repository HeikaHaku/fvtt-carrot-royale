/**
 * @extends {ItemSheet}
 */

export default class ItemSheetCarRoy extends ItemSheet {
  constructor(...args: any[]) {
    super(...args);

    //Expand the default size of a sheet.
    /*
    if (this.object.data.type === 'class') {
        this.options.width = this.position.width = 600;
        this.options.height = this.position.height = 680;
    }
    */
    this.options.classes?.concat([this.item.data.type]);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carroy', 'item', 'sheet'],
      width: 560,
      height: 400,
      scrollY: ['.tab.active'],
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
      dragDrop: [
        {
          dragSelector: '.enchantment',
          dropSelector: '.armor, .weapon',
          //permissions: { dragStart: this._canDragStart.bind(this), drop: this._canDragDrop.bind(this) },
          //callbacks: { dragStart: this._onDragStart.bind(this), drop: this._onDragDrop.bind(this) },
        },
      ],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = 'systems/carroy/templates/item';
    const type = this.item.data.type === 'magic' ? 'magic-item' : this.item.data.type;
    this.options.classes?.concat([this.item.data.type]);
    return `${path}/${type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData(): ItemSheet<any, any> {
    this.item.prepareData();
    const data: any = super.getData();
    data.labels = (this.item as { labels?: string[] }).labels;
    data.config = CONFIG.CarrotRoyale;

    // Item Type, Status, and Details
    data.itemType = game.i18n.localize(`ITEM.Type${data.item.type.titleCase()}`);
    data.itemStatus = this._getItemStatus(data.item);
    data.itemProperties = this._getItemProperties(data.item);
    data.isPhysical = data.item.data.hasOwnProperty('quantity');

    // Action Details
    data.hasAttackRoll = this.item.hasAttack;
    data.isHealing = data.item.data.actionType === 'healing';
    //data.isFlatDC = getProperty(data.item.data, 'save.scaling') === 'flat';
    data.isLine = ['line', 'wall'].includes(data.item.data.target?.type);

    data.hasCost = data.data.hasOwnProperty('cost');

    return data;
  }

  /* -------------------------------------------- */

  /**
   * Get the text item status which is shown beneath the Item type in the top-right corner of the sheet
   * @return {string}
   * @private
   */
  _getItemStatus(item: { type: string; data: { equipped: boolean; levels: Number } }) {
    if (item.type === 'spell') {
      //return CONFIG.DND5E.spellPreparationModes[item.data.preparation];
    } else if (['weapon', 'equipment', 'magic', 'armor'].includes(item.type)) {
      return game.i18n.localize(item.data.equipped ? 'CarRoy.Equipped' : 'CarRoy.NotEquipped');
    } else if (item.type === 'tool') {
      //return game.i18n.localize(item.data.proficient ? 'DND5E.Proficient' : 'DND5E.NotProficient');
    } else if (item.type === 'class') {
      return game.i18n.localize(`CarRoy.${item.data.levels}Level`);
    }
  }

  /* -------------------------------------------- */

  /**
   * Get the Array of item properties which are used in the small sidebar of the description tab
   * @return {Array}
   * @private
   */
  _getItemProperties(item: { labels: unknown; type: string; data: { properties: Array<any>; atWill: boolean; bonus: number; activation: Object } }) {
    const props: any[] = [];
    const labels = this.item.labels;

    if (item.type === 'weapon') {
      props.push(
        Object.entries(item.data.properties)
          .filter((e: any[]) => e[1] === true)
          .map((e: any[]) => CONFIG.CarrotRoyale.weaponProperties[e[0]])
      );
    } else if (item.type === 'spell') {
      props.push(item.data.atWill ? game.i18n.localize('CarRoy.AtWill') : null);
    } else if (item.type === 'enchantment') {
      props.push(`${item.data.bonus != 0 ? `${(item.data.bonus > 0 ? '+' : '') + item.data.bonus} ${game.i18n.localize('CarRoy.Bonus')}` : null}`);
    } else if (item.type === 'armor') {
      props.push(labels.armor, labels.armorType);
    }

    //Action Type

    //Action Usage
    if (item.type !== 'weapon' && item.data.activation && !isObjectEmpty(item.data.activation)) {
      props.push(labels.activation, labels.range, labels.target); //, labels.duration);
    }

    return props.filter((p: any) => !!p);

    /*const props = [];
    const labels = this.item.labels;

    if (item.type === 'weapon') {
      props.push(
        ...Object.entries(item.data.properties)
          .filter((e) => e[1] === true)
          .map((e) => CONFIG.DND5E.weaponProperties[e[0]])
      );
    } else if (item.type === 'spell') {
      props.push(
        labels.components,
        labels.materials,
        item.data.components.concentration ? game.i18n.localize('DND5E.Concentration') : null,
        item.data.components.ritual ? game.i18n.localize('DND5E.Ritual') : null
      );
    } else if (item.type === 'equipment') {
      props.push(CONFIG.DND5E.equipmentTypes[item.data.armor.type]);
      props.push(labels.armor);
    } else if (item.type === 'feat') {
      props.push(labels.featType);
    }

    // Action type
    if (item.data.actionType) {
      props.push(CONFIG.DND5E.itemActionTypes[item.data.actionType]);
    }

    // Action usage
    if (item.type !== 'weapon' && item.data.activation && !isObjectEmpty(item.data.activation)) {
      props.push(labels.activation, labels.range, labels.target, labels.duration);
    }
    return props.filter((p) => !!p);*/
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
    if (this.item.data.type !== 'enchantment') {
      const bonus = data.data?.bonus;
      if (bonus) bonus.stats = Object.values(bonus?.stats || {}).map((d: any) => [d[0] || '', d[1] || '']);
    }

    if (this.item.data.type === 'class') {
      const bonus = data.data?.bonus;
      if (bonus) {
        bonus.choices = Object.values(bonus?.choices || {}).map((d: any) => Object.values(d || {}).map((e: any) => [e[0] || '', e[1] || '']));
      }
    }

    if (['spell', 'feature'].includes(this.item.data.type)) {
      const summons = data.data?.summons;
      if (summons) {
        data.data.summons = Object.values(summons || {}).map((d: any) => [d || '']);
      }
    }

    // Return the flattened submission data
    return flattenObject(data);
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html: any) {
    super.activateListeners(html);
    if (this.isEditable) {
      html.find('.bonus-control').click(this._onBonusControl.bind(this));
      html.find('.choice-control').click(this._onChoiceControl.bind(this));
      html.find('.summon-control').click(this._onSummonControl.bind(this));
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

  /**
   * Add or remove a Choice part from the Class Choices List
   * @param {Event} event     The original click event
   * @return {Promise}
   * @private
   */
  async _onChoiceControl(event: any) {
    event.preventDefault();
    const a = event.currentTarget;

    // Add new damage component
    if (a.classList.contains('add-choice-group')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const bonus = this.item.data.data.bonus;
      const choices: any[] = bonus.choices;
      return this.item.update({ 'data.bonus.choices': choices.concat([[[]]]) });
    }

    if (a.classList.contains('add-choice')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest('.choice-group');
      const bonus = this.item.data.data.bonus;
      const choices: any[] = bonus.choices;
      const group = Number(li.dataset.choiceGroup);
      choices[group] = choices[group].concat([['', '']]);
      return this.item.update({ 'data.bonus.choices': choices });
    }

    // Remove a damage component
    if (a.classList.contains('delete-choice-group')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest('.choice-group');
      const bonus = duplicate(this.item.data.data.bonus);
      bonus.choices.splice(Number(li.dataset.choiceGroup), 1);
      return this.item.update({ 'data.bonus.choices': bonus.choices });
    }

    // Remove a damage component
    if (a.classList.contains('delete-choice')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const groupli = a.closest('.choice-group');
      const li = a.closest('.choice-part');
      const bonus = duplicate(this.item.data.data.bonus);
      const choices = bonus.choices;
      const group = Number(groupli.dataset.choiceGroup);
      choices[group].splice(Number(li.dataset.ChoicePart), 1);
      return this.item.update({ 'data.bonus.choices': choices });
    }
  }

  /* -------------------------------------------- */

  /**
   * Add or remove a Summon part from the Summons List
   * @param {Event} event     The original click event
   * @return {Promise}
   * @private
   */
  async _onSummonControl(event: any) {
    event.preventDefault();
    const a = event.currentTarget;

    // Add new damage component
    if (a.classList.contains('add-summon')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const summons = this.item.data.data.summons;
      return this.item.update({ 'data.summons': summons.concat([['']]) });
    }

    // Remove a damage component
    if (a.classList.contains('delete-summon')) {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest('.summon-part');
      const summons = duplicate(this.item.data.data.summons);
      summons.splice(Number(li.dataset.summonPart), 1);
      return this.item.update({ 'data.summons': summons });
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onSubmit(...args: [Event | JQuery.Event, { updateData?: any; preventClose?: boolean }?]) {
    if (this._tabs[0].active === 'details') this.position.height = 'auto';
    await super._onSubmit(...args);
  }

  /*
  _canDragDrop(): boolean {
    //return this.
    //return true;
    return this._dragDrop.reduce((a: boolean, b: any) => {
      if (b.can('dragStart', b.dragSelector)) a = true;
      return a;
    }, false);
  }

  _canDragStart(): boolean {
    return this._dragDrop.reduce((a: boolean, b: any) => {
      if (b.can('dragStart', b.dragSelector)) a = true;
      return a;
    }, false);
  }*/

  /*protected _onDragStart() {}

  protected _onDragDrop() {}*/

  /** @override */
  async _onDropItemCreate(itemData: ItemData) {
    // Create a Consumable spell scroll on the Inventory tab
    //if (itemData.type === 'spell' && this._tabs[0].active === 'inventory') {
    //const scroll = await ItemCarRoy.createScrollFromSpell(itemData);
    //itemData = scroll.data;
    //}
    // Create the owned item as normal
    //console.log(itemData, this);
    //return super._onDropItemCreate(itemData);
  }
}
