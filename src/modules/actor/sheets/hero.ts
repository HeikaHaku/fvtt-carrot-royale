import ActorClassConfig from '../../apps/class-config.js';
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
          console.log(itemData);
          await cls.update({ 'data.levels': next });
          return await this._prepareMainClass(itemData, cls);
        } else return;
      } else if (this.actor.data.data.details.level >= 5) return;
      else {
        let toCreate = [];
        const features = await ActorCarRoy.getClassFeatures({ className: itemData.name, level: 1, priorLevel: 0 });
        const existing = new Set(this.actor.items.map((i: { name: any }) => i.name));
        for (let f of features) {
          if (!existing.has(f.name)) toCreate.push(f);
        }
        if (toCreate.length) await this.actor.createEmbeddedEntity('OwnedItem', toCreate);
        this._prepareMainClass(itemData);
        /*if (this.actor.data.data.details.level == 0) {
          const clsConfig = CONFIG.CarrotRoyale.classFeatures[itemData.name.toLowerCase()];
          //console.log(clsConfig, CONFIG.CarrotRoyale, itemData.name);
          if (clsConfig) {
            await this.actor.update({
              'flags.carroy.mainClass': itemData.name.toLowerCase(),
            });
          }
        } else this._prepareMainClass(itemData);*/
      }
    }

    if (itemData.type === 'race') {
      const race = this.actor.itemTypes.race.find((r: any) => r);

      if (!!race) {
        return await race.update(itemData);
      }
    }

    // Default drop handling if levels were not added
    await super._onDropItemCreate(itemData);
  }

  private async _prepareMainClass(itemData: any, cls: any = null) {
    let main = this.actor.itemTypes.class.reduce((a: null | any[] | any, b: { data: { data: { levels: number }; levels: any } }) => {
      if (a === null) return (a = b);
      if (Array.isArray(a)) {
        let tmp = 0;
        a.forEach((i) => (tmp < i.data.data.levels ? (tmp = i.data.data.levels) : (tmp = tmp)));
        if (b.data.data.levels == tmp) a.push(b);
      } else a.data.data.levels == b.data.data.levels ? (a = [a, b]) : a.data.data.levels < b.data.data.levels ? (a = b) : (a = a);
      return a;
    }, null);
    if (main == null) return await this.actor.update({ 'flags.carroy.mainClass': itemData.name.toLowerCase() });
    if (Array.isArray(main))
      main[0].data.data.levels < (itemData as any).levels
        ? (main = cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
        : main[0].data.data.levels == (itemData as any).levels
        ? main.push(cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
        : (main = main);
    else
      main.data.data.levels < (itemData as any).levels
        ? (main = cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
        : main.data.data.levels == (itemData as any).levels
        ? (main = [main, cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } }])
        : (main = main);

    if (Array.isArray(main)) {
      if (
        !main.reduce((a, b) => {
          if (this.actor.data.flags.carroy.mainClass) a = a || this.actor.data.flags.carroy.mainClass === b.data.name.toLowerCase();
          else a = true;
          return a;
        }, false)
      )
        return await this.actor.update({ 'flags.carroy.mainClass': main[~~(Math.random() * main.length)].data.name.toLowerCase() });
      else return;
    } else
      this.actor.data?.flags?.carroy?.mainClass === main.data.name.toLowerCase()
        ? (main = main)
        : await this.actor.update({ 'flags.carroy.mainClass': main.data.name.toLowerCase() });
  }
}
