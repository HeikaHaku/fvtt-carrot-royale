import ItemCarRoy from '../../item/entity.js';
import { CarrotRoyale } from '../../config.js';

/**
 * Extend the basic ActorSheet class to suppose system-specific logic and functionality.
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class ActorSheetCarRoy extends ActorSheet {
  _filters: any;
  constructor(...args: any[]) {
    super(...args);

    this._filters = {
      inventory: new Set(),
      spellbook: new Set(),
      features: new Set(),
      effects: new Set(),
    };
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: ['.inventory .inventory-list', '.features .inventory-list', '.spellbook .inventory-list', '.effects .inventory-list'],
      tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'description' }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    if (!game.user.isGM && this.actor.limited) return 'systems/carroy/templates/actor/limited-sheet.html';
    return `systems/carroy/templates/actor/${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    //Basic Data
    let isOwner = this.entity.owner;
    const data: any = {
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isHero: this.entity.data.type === 'hero',
      isSummon: this.entity.data.type === 'summon',
      config: CONFIG.CarrotRoyale,
    };

    data.actor = duplicate(this.actor.data);
    data.items = this.actor.items.map((i: any) => {
      i.data.labels = i.labels;
      return i.data;
    });

    // The Actor and its Items
    data.items.sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));
    data.data = data.actor.data;
    data.labels = this.actor.labels || {};
    data.filters = this._filters;

    // Ability Scores
    for (let [a, abl] of Object.entries(data.actor.data.abilities) as [string, any]) {
      abl.label = CONFIG.CarrotRoyale.abilities[a];
    }

    // Movement speeds
    data.movement = this._getMovementSpeed(data.actor);

    // Update traits
    //this._prepareTraits(data.actor.data.traits);

    // Prepare owned items
    this._prepareItems(data);

    // Prepare active effects
    //data.effects = prepareActiveEffectCategories(this.entity.effects);

    // Return data to the sheet
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the display of movement speed data for the Actor*
   * @param {object} actorData                The Actor data being prepared.
   * @param {boolean} [largestPrimary=false]  Show the largest movement speed as "primary", otherwise show "walk"
   * @returns {{primary: string, special: string}}
   * @private
   */
  _getMovementSpeed(actorData: any): number {
    let movement: number = actorData.data?.attributes?.movement?.value || 6;
    const race = actorData.data?.details?.race;
    if (race) {
      const raceConfig = CONFIG.CarrotRoyale.raceFeatures[race.name?.toLowerCase()];
      movement += raceConfig?.bonus.stats.movement || 0;
    }
    const armor = actorData.items
      .filter((item: { type: string }) => item.type === 'armor')
      .reduce((a: number, b: { data: { armorType: any } }) => {
        const type = b.data.armorType;
        if (type === 'shield') return a;
        const cur = ['light', 'medium', 'heavy'].indexOf(type);
        return a < cur ? cur : a;
      }, 0);
    const item = actorData.items
      .filter((item: { type: string; data: { bonus: { stats: any } } }) => !['race', 'class'].includes(item.type) && item.data.bonus?.stats)
      .reduce((a: number, b: { data: { bonus: { stats: any } } }) => {
        const stats = b.data.bonus.stats;
        for (let stat of stats) {
          if (stat[1] === 'move') a += parseInt(stat[0]);
        }
        return a;
      }, 0);
    return movement - armor + item;
  }

  /* -------------------------------------------- */

  /**
   * Insert a spell into the spellbook object when rendering the character sheet
   * @param {Object} data     The Actor data being prepared
   * @param {Array} spells    The spell data being prepared
   * @private
   */
  _prepareSpellbook(data: any, spells: any[]) {
    const owner = this.actor.owner;
    const spellList = data.data.spells;
    const spellbook: any = {};

    const sections = {
      atwill: -20,
    };

    const useLabels: { [type: number]: string } = {
      '-20': '-',
    };

    const registerSection = (sl: any, i: number, label: any, { value, max, override } = { value: 0, max: 0, override: 0 }) => {
      spellbook[i] = {
        order: i,
        label: label,
        canCreate: owner,
        spells: [],
        uses: useLabels[i] || value || 0,
        slots: useLabels[i] || max || 0,
        override: override || 0,
        dataset: { type: 'spell' },
        prop: sl,
      };
    };

    let atWill = false;
    for (let s of spells) {
      if (s.data.atWill) {
        atWill = true;
        break;
      }
    }

    if (atWill) {
      registerSection('atwill', 0, game.i18n.localize('CarRoy.AtWill'));
    }
    //registerSection('spell', 1, 'CarRoy.Spells', { value: 1, max: 1, override: 0 });

    // Iterate over every spell item, adding spells to the spellbook by section
    spells.forEach((spell) => {
      let atWill = spell.data.atWill ? 0 : 1;

      if (!spell.data.atWill && !spellbook[1]) registerSection('spell', 1, game.i18n.localize('CarRoy.ItemTypeSpellPl'), { value: 1, max: 1, override: 0 });

      spellbook[atWill].spells.push(spell);
    });

    // Sort the spellbook by section.
    const sorted: { order: number }[] = Object.values(spellbook);
    sorted.sort((a, b) => a.order - b.order);
    return sorted;
  }

  /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @return {boolean}
   * @private
   */
  _filterItems(items: Item[], filters: any) {
    return items.filter((item: any) => {
      const data = item.data;

      // Action Usage
      for (let f of ['action', 'bonus', 'reaction']) {
        if (filters.has(f)) {
          if (data.activation?.type !== f) return false;
        }
      }

      // Spell-specific filters
      if (filters.has('concentration')) {
        if (data.components.concentration !== true) return false;
      }

      // Equipment-specific filters
      if (filters.has('equipped')) {
        if (data.equipped !== true) return false;
      }

      return true;
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html: JQuery) {
    // Activate Item Filters
    const filterLists = html.find('.filter-list');
    filterLists.each(this._initializeFilterItemList.bind(this));
    filterLists.on('click', '.filter-item', this._onToggleFilter.bind(this));

    // Item summaries
    html.find('.item .item-name.rollable h4').click((event) => this._onItemSummary(event));

    // Editable Only Listeners
    if (this.isEditable) {
      // Input focus and update
      const inputs = html.find('input');
      inputs.focus((ev) => ev.currentTarget.select());
      inputs.addBack().find('[data-dtype="Number"]').on('change', this._onChangeInputDelta.bind(this));

      // Ability Proficiency
      //html.find('.ability-proficiency').click(this._onToggleAbilityProficiency.bind(this));

      // Toggle Skill Proficiency
      //html.find('.skill-proficiency').on('click contextmenu', this._onCycleSkillProficiency.bind(this));

      // Trait Selector
      //html.find('.trait-selector').click(this._onTraitSelector.bind(this));

      // Configure Special Flags
      //html.find('.config-button').click(this._onConfigMenu.bind(this));

      // Owned Item management
      html.find('.item-create').click(this._onItemCreate.bind(this));
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      html.find('.item-delete').click(this._onItemDelete.bind(this));
      //html
      //.find('.item-uses input')
      //.click((ev) => ev.target.select())
      //.change(this._onUsesChange.bind(this));
      //html.find('.slot-max-override').click(this._onSpellSlotOverride.bind(this));

      // Active Effect management
      //html.find('.effect-control').click((ev) => onManageActiveEffect(ev, this.entity));
    }

    // Owner Only Listeners
    if (this.actor.owner) {
      // Ability Checks
      html.find('.ability-name').click(this._onRollAbilityTest.bind(this));

      // Roll Skill Checks
      //html.find('.skill-name').click(this._onRollSkillCheck.bind(this));

      // Item Rolling
      html.find('.item .item-image').on('click', (event) => this._onItemRoll(event));
      //html.find('.item .item-recharge').click((event) => this._onItemRecharge(event));
    }

    // Otherwise remove rollable classes
    else {
      html.find('.rollable').each((i, el) => el.classList.remove('rollable'));
    }

    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }

  /* -------------------------------------------- */

  /**
   * Iinitialize Item list filters by activating the set of filters which are currently applied
   * @private
   */
  _initializeFilterItemList(i: any, ul: any) {
    const set = this._filters[ul.dataset.filter];
    const filters = ul.querySelectorAll('.filter-item');
    for (let li of filters) {
      if (set.has(li.dataset.filter)) li.classList.add('active');
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle input changes to numeric form fields, allowing them to accept delta-typed inputs
   * @param event
   * @private
   */
  _onChangeInputDelta(event: any) {
    const input = event.target;
    const value = input.value;
    if (['+', '-'].includes(value[0])) {
      let delta = parseFloat(value);
      input.value = getProperty(this.actor.data, input.name) + delta;
    } else if (value[0] === '=') {
      input.value = value.slice(1);
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDropItemCreate(itemData: ItemData) {
    // Create a Consumable spell scroll on the Inventory tab
    //if (itemData.type === 'spell' && this._tabs[0].active === 'inventory') {
    //const scroll = await ItemCarRoy.createScrollFromSpell(itemData);
    //itemData = scroll.data;
    //}

    // Create the owned item as normal
    return super._onDropItemCreate(itemData);
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemRoll(event: any) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
    return item.roll();
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemSummary(event: any) {
    event.preventDefault();
    let li = $(event.currentTarget).parents('.item'),
      item = this.actor.getOwnedItem(li.data('item-id')),
      chatData = item.getChatData({ secrets: this.actor.owner });

    // Toggle summary
    if (li.hasClass('expanded')) {
      let summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${chatData.description}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      chatData.properties.forEach((p: { append: Function }) => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event: any) {
    event.preventDefault();
    const header = event.currentTarget;
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
    return this.actor.createEmbeddedEntity('OwnedItem', itemData);
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemEdit(event: any) {
    event.preventDefault();
    const li = event.currentTarget.closest('.item');
    const item = this.actor.getOwnedItem(li.dataset.itemId);
    item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event: any) {
    event.preventDefault();
    const li = event.currentTarget.closest('.item');
    const item = this.actor.items.get(li.dataset.itemId);
    this.actor.deleteOwnedItem(li.dataset.itemId);
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling an Ability check, either a test or a saving throw
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollAbilityTest(event: any) {
    event.preventDefault();
    let ability = event.currentTarget.parentElement.dataset.ability;
    this.actor.rollAbility(ability, { event: event });
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling of filters to display a different set of owned items
   * @param {Event} event     The click event which triggered the toggle
   * @private
   */
  _onToggleFilter(event: any) {
    event.preventDefault();
    const li = event.currentTarget;
    const set = this._filters[li.parentElement.dataset.filter];
    const filter = li.dataset.filter;
    if (set.has(filter)) set.delete(filter);
    else set.add(filter);
    this.render();
  }

  /* -------------------------------------------- */
}
