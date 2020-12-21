/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemCarRoy extends Item {
  labels: unknown;
  constructor(...args: [data: EntityData<unknown>, options: any]) {
    super(...args);

    this.labels = {};
  }

  /**
   * Determine which ability score modifier is used by this item
   * @type {string|null}
   */
  get abilityMod() {
    const itemData = this.data.data;
    if (!('ability' in itemData)) return null;

    // Case 1 - defined directly by the item
    if (itemData.ability) return itemData.ability;
    // Case 2 - inferred from a parent actor
    else if (this.actor) {
      const actorData = this.actor.data.data;

      // Spells - Use Actor spellcasting modifier
      if (this.data.type === 'spell') return actorData.attributes.spellcasting || 'int';
      // Tools - default to Intelligence
      else if (this.data.type === 'tool') return 'int';
      // Weapons
      else if (this.data.type === 'weapon') {
        const wt = itemData.weaponType;

        // Melee weapons - Str or Dex if Finesse (PHB pg. 147)
        if (['simpleM', 'martialM'].includes(wt)) {
          if (itemData.properties.fin === true) {
            // Finesse weapons
            return actorData.abilities['dex'].mod >= actorData.abilities['str'].mod ? 'dex' : 'str';
          }
          return 'str';
        }

        // Ranged weapons - Dex (PH p.194)
        else if (['simpleR', 'martialR'].includes(wt)) return 'dex';
      }
      return 'str';
    }

    // Case 3 - unknown
    return null;
  }

  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */
  /**
   * Augment the basic Item data model with additional dynamic data.
   */

  prepareData() {
    super.prepareData();

    const itemData = this.data;
    const data = itemData.data;
    const C = CONFIG.CarrotRoyale;
    const labels: any = (this.labels = {});

    //Classes
    if (itemData.type === 'class') data.levels = Math.clamped(data.levels, 1, 5);
    //Spells
    //Feats
    else if (itemData.type === 'feat') {
      const act = data.activation;
    }

    // <li>{{data.armorType}}{{#if data.armorType}}{{#unless (eq data.armorType 'shield')}} {{itemType}}{{/unless}}{{/if}}</li>
    //Armor and Shields
    else if (itemData.type === 'armor') {
      labels.armor = data.armorType ? `${data.ac} ${game.i18n.localize('CarRoy.AC')}` : '';
      labels.armorType = data.armorType ? `${data.armorType}${data.armorType === 'shield' ? '' : ` ${itemData.type}`}`.titleCase() : '';
    }

    //Activated Items
    if (data.hasOwnProperty('activation')) {
      //Ability Activation Label
      let act = data.activation || {};
      if (act) labels.activation = [act.cost, game.i18n.localize(C.activationTypes[act.type])].filterJoin(' ');

      //Target Label
      let tgt = data.target || {};
      if (['none', 'touch', 'self'].includes(tgt.units)) tgt.value = null;
      if (['none', 'self'].includes(tgt.type)) {
        tgt.value = null;
        tgt.units = null;
      }
      labels.target = [tgt.value, C.distanceUnits[tgt.units], C.targetTypes[tgt.type]].filterJoin(' ');

      //Range Label
      let rng = data.range || {};
      if (['none', 'touch', 'Self'].includes(rng.units) || rng.value === 0) rng.value = null;
      labels.range = [rng.value, C.distanceUnits[rng.units]].filterJoin(' ');

      //Duration Label
      let dur = data.duration || {};
    }

    //Item Actions
    if (data.hasOwnProperty('action')) {
    }
  }
}
