import ActorCarRoy from '../actor/entity.js';
import ItemCarRoy from '../item/entity.js';
import { prepareMainClass } from '../utils.js';

/**
 * A simple form to set actor movement speeds
 * @implements {BaseEntitySheet}
 */
export default class CharacterBuilder extends BaseEntitySheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'char-builder',
      classes: ['carroy', 'char-builder'],
      template: 'systems/carroy/templates/apps/character-builder.html',
      width: 500,
      height: 'auto',
      closeOnSubmit: true,
      scrollY: ['.cb', '.shop', '.race', '.misc'],
      tabs: [{ navSelector: '.tabs', contentSelector: '.form-body', initial: 'hero' }],
    });
  }

  /* -------------------------------------------- */

  cb: { [key: string]: number } = Object.keys(CONFIG.CarrotRoyale.classFeatures).reduce((a: { [key: string]: number }, b: string): {} => {
    a[b] = 0;
    return a;
  }, {});
  races = Object.keys(CONFIG.CarrotRoyale.raceFeatures);
  race?: unknown;
  shop: any;

  /* -------------------------------------------- */

  /** @override */
  get title() {
    return `${game.i18n.localize('CarRoy.CharBuilder')}: ${(this.object as { name?: '' })?.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data: Record<string, any> = {};
    data.actor = this.object;

    data.classList = Object.keys(CONFIG.CarrotRoyale.classFeatures);
    data.cb = this.cb;
    data.races = this.races;
    if (!this.shop) this.shop = await this.initShop;
    data.shop = this.shop;

    data.sections = {
      weapon: { label: 'CarRoy.ItemTypeWeaponPl', items: data.shop.weapons, name: 'weapons', dataset: { type: 'weapon' } },
      armor: { label: 'CarRoy.ItemTypeArmorPl', items: data.shop.armors, name: 'armors', dataset: { type: 'armor' } },
      magic: { label: 'CarRoy.ItemTypeMagicItemPl', items: data.shop.magic, name: 'magic', dataset: { type: 'magic' } },
    };

    return data;
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /** @override */
  _getSubmitData(updateData = {}): any {
    // Create the expanded update data object
    const fd = new FormDataExtended(this.form as HTMLElement, { editors: this.editors });
    let data = fd.toObject();
    if (updateData) data = mergeObject(data, updateData);
    else data = expandObject(data);

    // Return the flattened submission data
    return flattenObject(data);
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

    //Class Selection
    html.find('.cb-toggle').contextmenu(this._onCBRemove.bind(this));
    html.find('.cb-toggle').click(this._onCBAdd.bind(this));

    //Race Selection
    html.find('.race-select').click(this._onRaceSelect.bind(this));

    //Shop
    html.find('.item-select').click(this._onAddItem.bind(this));
    html.find('.item-select').contextmenu(this._onRemoveItem.bind(this));

    //Submit Character Builder Data.
    html.find('.cb-submit').click(this._onCBSubmit.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onCBSubmit(event: any) {
    event.preventDefault();

    const actor = this.object as ActorCarRoy;

    actor.items.forEach(async (item: { delete: () => any }) => await item.delete());
    await actor.update({ items: [] });
    const cb = Object.entries(this.cb).reduce((a: { [name: string]: number }, b) => {
      if (b[1]) a[b[0]] = b[1];
      return a;
    }, {});

    const items = Object.values(this.shop).reduce((a: any[], b: any) => {
      for (let item of b) {
        for (let i = 0; i < item.quantity; i++) {
          a.push(item.item);
        }
      }
      return a;
    }, []);

    console.log(items);

    const pack = game.packs?.get('carroy.classes-cr');
    if (!pack) return;
    await pack.getIndex();

    let toCreate: any[] = this.race ? [this.race] : [];
    toCreate = toCreate.concat(items);

    console.log(toCreate);

    for (let [cls, level] of Object.entries(cb)) {
      let entry = pack.index.find((i) => i.name.toLowerCase() === cls.toLowerCase());
      if (!entry) continue;
      await pack.getEntity(entry._id).then(async (cl: any) => {
        const c = duplicate(cl);
        c.data.levels = level;

        await actor.createEmbeddedEntity('OwnedItem', c);

        for (let index = 1; index <= level; index++) {
          const features = await CharacterBuilder.getClassFeatures({ className: cls, level: index, priorLevel: index - 1 });
          const existing = new Set(actor.items.map((i: { name: any }) => i.name));
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
      });
    }

    if (toCreate.length) await actor.createEmbeddedEntity('OwnedItem', toCreate);

    await actor.update({ 'data.attributes.hp.value': actor.data.data.attributes.hp.max });
    await prepareMainClass(actor);

    await this.submit();
    await this.close();
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
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRaceSelect(event: any) {
    event.preventDefault();
    const header = event.currentTarget;
    $('.race-select').removeClass('active');
    header.classList.add('active');

    const pack = game.packs?.get('carroy.races-cr');
    if (!pack) return;
    await pack.getIndex();

    let entry = pack.index.find((i) => i.name.toLowerCase() === header.dataset.name);
    if (!entry) return;

    await pack.getEntity(entry._id).then(async (r: any) => {
      this.race = duplicate(r);
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAddItem(event: any) {
    event.preventDefault();
    const header = event.currentTarget;
    const id = Number.parseInt(header.dataset.id);

    console.log(this.shop, header);

    switch (header.dataset.section) {
      case 'weapon':
        this.shop.weapons[id].quantity++;
        break;
      case 'armor':
        this.shop.armors[id].quantity++;
        break;
      case 'magic':
        this.shop.magic[id].quantity++;
        break;
      default:
        break;
    }
    this.render();
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRemoveItem(event: any) {
    event.preventDefault();
    const header = event.currentTarget;
    const id = Number.parseInt(header.dataset.id);

    switch (header.dataset.section) {
      case 'weapon':
        this.shop.weapons[id].quantity--;
        break;
      case 'armor':
        this.shop.armors[id].quantity--;
        break;
      case 'magic':
        this.shop.magic[id].quantity--;
        break;
      default:
        break;
    }
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Return the features which a character is awarded for each class level
   * @param {string} className        The class name being added
   * @param {number} level            The number of levels in the added class
   * @param {number} priorLevel       The previous level of the added class
   * @return {Promise<ItemCarRoy[]>}     Array of ItemCarRoy entities
   */
  static async getClassFeatures({ className = '', level = 1, priorLevel = 0 } = {}) {
    className = className.toLowerCase();

    const clsConfig = CONFIG.CarrotRoyale.classFeatures[className];
    if (!clsConfig) return [];

    let ids: string[] = [];
    let overrides: { [id: string]: { level?: number; uses?: number } } = {};
    for (let [l, f] of Object.entries(clsConfig.features || {}) as any[]) {
      l = parseInt(l);
      if (l <= level && l > priorLevel) {
        for (let m of Object.values(f) as [{ id: string; level?: number; uses?: number }]) {
          if (m.level || m.uses) overrides[m.id] = m;
          ids = ids.concat(m.id);
        }
      }
    }

    const features: any[] = await Promise.all(
      ids.map(async (id) => {
        let item = duplicate(await fromUuid(id)) as any;
        if (overrides[id]?.level) item.data.level = overrides[id].level;
        if (overrides[id]?.uses) item.data.uses.limit += overrides[id].uses;
        return item;
      })
    );

    return features;
  }

  get initShop() {
    return (async () => {
      type shop = {
        item: any;
        quantity: number;
      }[];
      const shop: { weapons: shop; armors: shop; magic: shop } = {
        weapons: [],
        armors: [],
        magic: [],
      };

      const weapons = game.packs?.get('carroy.weapons-cr');
      if (!weapons) return;
      await weapons.getIndex();

      const armors = game.packs?.get('carroy.armors-cr');
      if (!armors) return;
      await armors.getIndex();

      const magic = game.packs?.get('carroy.magic-items-cr');
      if (!magic) return;
      await magic.getIndex();

      for (let entry of weapons.index) {
        await weapons.getEntity(entry._id).then(async (cl: any) => {
          const c = duplicate(cl);
          shop.weapons.push({ item: c, quantity: 0 });
        });
      }

      for (let entry of armors.index) {
        await armors.getEntity(entry._id).then(async (cl: any) => {
          const c = duplicate(cl);
          shop.armors.push({ item: c, quantity: 0 });
        });
      }

      for (let entry of magic.index) {
        await magic.getEntity(entry._id).then(async (cl: any) => {
          const c = duplicate(cl);
          shop.magic.push({ item: c, quantity: 0 });
        });
      }

      return shop;
    })().then((value) => value);
  }
}
