import ActorClassConfig from '../../apps/class-config.js';
import ItemCarRoy from '../../item/entity.js';
import { prepareMainClass } from '../../utils.js';
import ActorCarRoy from '../entity.js';
import ActorSheetCarRoy from './base.js';

/**
 * @extends {ActorSheetCarRoy}
 */
export class HeroSheet extends ActorSheetCarRoy {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carroy', 'actor', 'sheet', 'hero'],
      //template: 'systems/carroy/templates/actor/hero-sheet.html',
      width: 600,
      height: 680,
    });
  }

  cb: { [key: string]: number } = Object.keys(CONFIG.CarrotRoyale.classFeatures).reduce((a: { [key: string]: number }, b: string): {} => {
    a[b] = 0;
    return a;
  }, {});

  /* -------------------------------------------- */

  /**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  async getData() {
    const sheetData: any = super.getData();

    // Temporary HP
    let hp = sheetData.data.attributes.hp;
    if (hp.temp === 0) delete hp.temp;
    if (hp.tempmax === 0) delete hp.tempmax;

    sheetData.isSpellcaster;
    sheetData.isMelee;

    sheetData.classList = Object.keys(CONFIG.CarrotRoyale.classFeatures);
    sheetData.cb = this.cb;

    sheetData.race = this.actor.itemTypes.race.find((r: any) => r);

    // Resources
    /*sheetData["resources"] = ["primary", "secondary", "tertiary"].reduce((arr, r) => {
      const res = sheetData.data.resources[r] || {};
      res.name = r;
      res.placeholder = game.i18n.localize("DND5E.Resource"+r.titleCase());
      if (res && res.value === 0) delete res.value;
      if (res && res.max === 0) delete res.max;
      return arr.concat([res]);
    }, []);

    // Experience Tracking
    sheetData["disableExperience"] = game.settings.get("dnd5e", "disableExperienceTracking");
    sheetData["classLabels"] = this.actor.itemTypes.class.map(c => c.name).join(", ");*/

    // Return data for rendering
    return sheetData;
  }

  /* -------------------------------------------- */

  /**
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data: any) {
    // Categorize items as inventory, spellbook, features, and classes
    const inventory: { [type: string]: any } = {
      weapon: { label: 'CarRoy.ItemTypeWeaponPl', items: [], dataset: { type: 'weapon' } },
      armor: { label: 'CarRoy.ItemTypeArmorPl', items: [], dataset: { type: 'armor' } },
      magic: { label: 'CarRoy.ItemTypeMagicItemPl', items: [], dataset: { type: 'magic' } },
    };

    let [items, spells, feats, classes, races]: Item[][] = data.items.reduce(
      (arr: Item[][], item: any) => {
        // Item Details
        item.img = item.img || DEFAULT_TOKEN;

        // Item Usage
        item.hasTarget = !!item.data.target && !['none', ''].includes(item.data.target.type);

        // Item Toggle State

        // Classify Items into types
        if (item.type === 'spell') arr[1].push(item);
        else if (item.type === 'feature') arr[2].push(item);
        else if (item.type === 'class') arr[3].push(item);
        else if (item.type === 'race') arr[4].push(item);
        else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);

        return arr;
      },
      [[], [], [], [], []]
    );

    // Apply Active Item Filters
    items = this._filterItems(items, this._filters.inventory);
    spells = this._filterItems(spells, this._filters.spellbook);
    feats = this._filterItems(feats, this._filters.features);

    for (let i of items) {
      inventory[i.type].items.push(i);
    }

    //Organize Spellbook
    const spellbook = this._prepareSpellbook(data, spells);

    //Organize Features
    const features: {
      [type: string]: {
        label: string;
        items: any[];
        hasActions: boolean;
        dataset: Object;
        isClass?: boolean;
        isRace?: boolean;
      };
    } = {
      classes: { label: 'CarRoy.ItemTypeClassPl', items: [], hasActions: false, dataset: { type: 'class' }, isClass: true },
      race: { label: 'CarRoy.Race', items: [], hasActions: false, dataset: { type: 'race' }, isRace: true },
      active: { label: 'CarRoy.FeatureActive', items: [], hasActions: true, dataset: { type: 'feature', 'activation.type': 'action' } },
      passive: { label: 'CarRoy.FeaturePassive', items: [], hasActions: false, dataset: { type: 'feature' } },
    };
    for (let f of feats) {
      if ((f.data as { activation?: { type: string } }).activation?.type) features.active.items.push(f);
      else features.passive.items.push(f);
    }
    (classes as any[]).sort((a: { levels: number }, b: { levels: number }) => b.levels - a.levels);
    features.classes.items = classes;
    features.race.items = races;

    //Assign and return
    data.inventory = Object.values(inventory);
    data.spellbook = spellbook;
    data.features = Object.values(features);
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html: any) {
    super.activateListeners(html);
    if (!this.options.editable) return;

    html.find('.cb-submit').click(this._onCBSubmit.bind(this));
    html.find('.cb-toggle').contextmenu(this._onCBRemove.bind(this));
    html.find('.cb-toggle').click(this._onCBAdd.bind(this));

    // Item State Toggling
    //html.find('.item-toggle').click(this._onToggleItem.bind(this));

    // Short and Long Rest
    //html.find('.short-rest').click(this._onShortRest.bind(this));
    //html.find('.long-rest').click(this._onLongRest.bind(this));

    // Rollable sheet actions
    html.find('.rollable[data-action]').click(this._onSheetAction.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onCBSubmit(event: any) {
    event.preventDefault();
    this.actor.items.forEach((item: { delete: () => any }) => item.delete());
    const cb = Object.entries(this.cb).reduce((a: { [name: string]: number }, b) => {
      if (b[1]) a[b[0]] = b[1];
      return a;
    }, {});

    const pack = game.packs?.get('carroy.classes-cr');
    if (!pack) return;
    await pack.getIndex();
    for (let [cls, level] of Object.entries(cb)) {
      let entry = pack.index.find((i) => i.name.toLowerCase() === cls.toLowerCase());
      if (!entry) continue;
      await pack.getEntity(entry._id).then(async (cl: any) => {
        const c = duplicate(cl);
        c.data.levels = level;
        //c?.update({ 'data.levels': level });
        //cl?.data.data.levels = level;
        await this.actor.createEmbeddedEntity('OwnedItem', c);
        let toCreate = [];
        for (let index = 1; index <= level; index++) {
          const features = await ActorCarRoy.getClassFeatures({ className: cls, level: index, priorLevel: index - 1 });
          const existing = new Set(this.actor.items.map((i: { name: any }) => i.name));
          for (let f of features)
            if (!existing.has(f.name)) {
              if (CONFIG.CarrotRoyale.featureScale.hasOwnProperty(f.name)) {
                const { name, formula } = CONFIG.CarrotRoyale.featureScale[f.name][f.data.level] || [f.name, f.data.formula];
                let f2: any = duplicate(f);
                [f2.name, f2.data.formula] = [name, formula];
                if (!existing.has(f2.name)) toCreate.push(f2);
              } else toCreate.push(f);
            }
        }
        await this.actor.update({ 'data.attributes.hp.value': 500 });

        if (toCreate.length) await this.actor.createEmbeddedEntity('OwnedItem', toCreate);

        //const features = await ActorCarRoy.getClassFeatures({ className: cls, level: level, priorLevel: 0 });
        //console.log(features);
        //await this.actor.createEmbeddedEntity('OwnedItem', features);
        this.render();
      });
    }
    /* 
    const pack = game.packs.get('carroy.classes-cr');
    pack.getIndex();
    let entry = pack.index.find(i => i.name === name);
    pack.getEntity(entry.id).then(spell => console.log(spell));
    */
    /*const header = event.currentTarget;
    const type = header.dataset.type;
    if (type === 'class') {
      if (this.actor.data.data.details.level >= 5) return;
    }
    if (type === 'race') {
      if (!!this.actor.itemTypes.race) return;
    }
    const itemData = {
      name: game.i18n.format('CarRoy.ItemNew', { type: type === 'magic' ? 'magic item'.capitalize() : type.capitalize() }),
      type: type,
      data: duplicate(header.dataset),
    };
    delete itemData.data['type'];
    return this.actor.createEmbeddedEntity('OwnedItem', itemData);*/
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onCBAdd(event: any) {
    event.preventDefault();
    const header = event.currentTarget;

    const cb: { [key: string]: number } = this.cb || {};
    //sheetData.cb = sheetData.cb || ({} as { [key: string]: number });
    const sum = Object.values(cb).reduce((a: number, b: number) => {
      return a + b;
    }, 0);
    if (sum >= 5) return;
    cb[header.dataset.name] = Math.clamped(cb[header.dataset.name] + 1, 0, 5);
    this.cb = cb;
    this.render();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onCBRemove(event: any) {
    event.preventDefault();
    const header = event.currentTarget;

    const cb: { [key: string]: number } = this.cb || {};
    cb[header.dataset.name] = Math.clamped(cb[header.dataset.name] - 1, 0, 5);
    this.cb = cb;
    this.render();
  }

  /**
   * Handle mouse click events for character sheet actions
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  _onSheetAction(event: MouseEvent) {
    event.preventDefault();
    const button: any = event.currentTarget;
    switch (button.dataset.action) {
      /*case 'convertCurrency':
        return Dialog.confirm({
          title: `${game.i18n.localize('DND5E.CurrencyConvert')}`,
          content: `<p>${game.i18n.localize('DND5E.CurrencyConvertHint')}</p>`,
          yes: () => this.actor.convertCurrency(),
        });*/
      case 'rollDeathSave':
        return this.actor.rollDeathSave({ event: event });
      case 'rollInitiative':
        return this.actor.rollInitiative({ createCombatants: true });
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDropItemCreate(itemData: ItemData) {
    // Increment the number of class levels a character instead of creating a new item
    if (itemData.type === 'class') {
      const cls = this.actor.itemTypes.class.find((c: any) => c.name === itemData.name);
      let priorLevel = cls?.data.data.levels ?? 0;
      if (!!cls) {
        const next = Math.min(priorLevel + 1, 5 + priorLevel - this.actor.data.data.details.level);
        if (next > priorLevel) {
          (itemData as any).levels = next;
          await cls.update({ 'data.levels': next });
          await this.actor.update({ 'data.attributes.hp.value': this.actor.data.data.attributes.hp.max });
          return await prepareMainClass(this.actor, itemData, cls);
        } else return;
      } else if (this.actor.data.data.details.level >= 5) return;
      else {
        let toCreate = [];
        const features = await ActorCarRoy.getClassFeatures({ className: itemData.name, level: 1, priorLevel: 0 });
        const existing = new Set(this.actor.items.map((i: { name: any }) => i.name));
        for (let f of features)
          if (!existing.has(f.name)) {
            if (CONFIG.CarrotRoyale.featureScale.hasOwnProperty(f.name)) {
              const { name, formula } = CONFIG.CarrotRoyale.featureScale[f.name][f.data.level] || [f.name, f.data.formula];
              let f2: any = duplicate(f);
              [f2.name, f2.data.formula] = [name, formula];
              if (!existing.has(f2.name)) toCreate.push(f2);
            } else toCreate.push(f);
          }
        if (!priorLevel) await this.actor.update({ 'data.attributes.hp.value': 500 });

        if (toCreate.length) await this.actor.createEmbeddedEntity('OwnedItem', toCreate);
        await prepareMainClass(this.actor, itemData);
        //await this.actor.update({ 'data.attributes.hp.value': this.actor.data.data.a });
      }
    }

    if (itemData.type === 'race') {
      const race = this.actor.itemTypes.race.find((r: any) => r);

      if (!!race) {
        return await race.update(itemData);
      }
    }

    if (itemData.type === 'enchantment') return;

    // Default drop handling if levels were not added
    await super._onDropItemCreate(itemData);
  }

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   * @override
   */
  async _onItemDelete(event: any) {
    await super._onItemDelete(event);

    await prepareMainClass(this.actor);
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

    data.data.team = parseInt(data.data.team);

    // Return the flattened submission data
    return flattenObject(data);
  }

  /** @override */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // Reset Button
    const canConfigure = game.user.isGM || this.actor.owner;
    if (this.options.editable && canConfigure) {
      buttons = [
        {
          label: game.i18n.localize('CarRoy.ResetSheet'),
          class: 'reset-sheet',
          icon: 'fas fa-eraser',
          onclick: (ev: any) => this._onClearAll(ev),
        },
      ].concat(buttons);
    }

    return buttons;
  }

  async _onClearAll(_event: any) {
    if (game.user.isGM || this.actor.owner) {
      let ids = this.actor.items.reduce((a: any[], b: { id: any }) => {
        a.push(b.id);
        return a;
      }, []);

      for (let id of ids) {
        await this.actor.deleteOwnedItem(id, {});
      }
    }
  }
}
