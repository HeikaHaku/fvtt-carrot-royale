import { CarrotRoyale } from '../config.js';
import { d20Roll, damageRoll } from '../dice.js';
import ItemCarRoy from '../item/entity.js';
import { getBonuses, prepareMainClass } from '../utils.js';

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorCarRoy extends Actor {
  /** @override */
  prepareBaseData() {
    switch (this.data.type) {
      case 'hero':
        return this._prepareCharacterData(this.data);
    }
  }

  /* -------------------------------------------- */
  /** @override */
  async prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.carroy || {};
    const bonuses = getProperty(data, 'bonuses.abilities') || {};

    if (this.data.type === 'hero') {
      const cls =
        CONFIG.CarrotRoyale.classFeatures[
          flags.mainClass ||
            this.itemTypes.class.reduce(
              (v, cur) => {
                if (v.data.data.levels < cur.data.data.levels) v = cur;
                return v;
              },
              { data: { data: { levels: 0 }, name: '' } }
            ).data.name
        ];
      data.abilities.str.value = cls?.abilities?.str || 10;
      data.abilities.dex.value = cls?.abilities?.dex || 10;
      data.abilities.con.value = cls?.abilities?.con || 10;
      data.abilities.int.value = cls?.abilities?.int || 10;
      data.abilities.wis.value = cls?.abilities?.wis || 10;
      data.abilities.cha.value = cls?.abilities?.cha || 10;

      const classBonuses = (Object.values(flags?.classSpecial || {}) as string[]).reduce((a: any, b) => {
        const tmp = b.split(',');
        if (tmp[0] === 'feature') return a;
        else a[tmp[0]] = (a[tmp[0]] || 0) + parseInt(tmp[1]);
        return a;
      }, {});

      const items = actorData.items.filter(
        (item: { type: string; data: { bonus: { stats: any } } }) => !['race', 'class'].includes(item.type) && item.data.bonus?.stats
      );
      const itemBonuses: Record<string, any> = {};
      items.forEach((item) => {
        for (let [stat, id] of item.data.bonus.stats) {
          if (!itemBonuses[id]) itemBonuses[id] = 0;
          itemBonuses[id] += parseInt(stat);
        }
      });
      const armors = actorData.items.filter((item: { type: string }) => item.type === 'armor');

      const race = actorData.items.find((item: { type: string }) => item.type === 'race');
      const raceConfig = race ? CONFIG.CarrotRoyale.raceFeatures[race.name?.toLowerCase()] : {};

      // Ability modifiers and saves
      const saves = await getBonuses(this, 'saves');
      for (let [id, abl] of Object.entries(data.abilities) as [string, any]) {
        /*abl.mod = Math.floor((abl.value + (abl?.bonus || 0) - 10) / 2);
      abl.total = abl.value + (abl?.bonus || 0);*/
        abl.total = abl.value + (await getBonuses(this, abl)).number; //(raceConfig?.bonus?.stats?.[id] || 0) + (itemBonuses[id] || 0);
        abl.mod = Math.floor((abl.total - 10) / 2);
        abl.save = abl.mod + saves; //(raceConfig?.bonus?.stats?.saves || 0) + (itemBonuses['saves'] || 0) + (classBonuses?.saves || 0);
      }

      // Determine Initiative Modifier
      const init = data.attributes.init;
      init.mod = data.abilities.dex.mod;
      init.bonus = (await getBonuses(this, 'init')).number + (init?.bonus || 0);
      init.total = init.mod + init.bonus;
      //init.total = init.mod + init.bonus + (await getBonuses(this, 'init')) + (raceConfig?.bonus?.stats?.init || 0) + (classBonuses?.init || 0);

      const ac = data.attributes.ac;
      const armorAC = armors.reduce(
        (a, b) => {
          const type = b.data.armorType;
          if (type === 'shield') {
            a.shield = a.shield < b.data.ac ? b.data.ac : a.shield;
            a.shield += parseInt(b.data?.enchantment?.value || 0);
            return a;
          }
          const cur = ['light', 'medium', 'heavy'].indexOf(type);
          a.type = a.type < cur ? cur : a.type;
          a.ac = a.type === cur ? b.data.ac : a.ac;
          a.ac += parseInt(b.data?.enchantment?.value || 0);
          return a;
        },
        { shield: 0, type: -1, ac: 0 }
      );

      ac.value = 6 + data.abilities.dex.mod + (armorAC.ac || 0) + (armorAC.shield || 0) + (await getBonuses(this, 'ac', true)).number;

      const hp = data.attributes.hp;
      if (hp.max && hp.value > hp.max) hp.value = hp.max;
      let tmp = hp.max - hp.value;
      const baseHP = actorData.items
        .filter((item: { type: string }) => item.type === 'class')
        .reduce((a: any, b: { name: string; data: { levels: number } }) => {
          a += b.data.levels * ((CONFIG.CarrotRoyale.classFeatures[b.name.toLowerCase()]?.abilities?.hp || 0) + data.abilities.con.mod);
          return a;
        }, 0);
      hp.max = baseHP + (await getBonuses(this, 'hp')).number; //(raceConfig?.bonus?.stats?.hp || 0) + (itemBonuses?.hp || 0);
      if (tmp > hp.max) tmp = hp.max;
      hp.value = hp.value == 0 ? 0 : hp.max - tmp;

      /*try {
        if (this.owner) await this.update({ data: data }, { diff: true });
      } catch {}*/
    } else if (this.data.type === 'summon') {
      const smn = CONFIG.CarrotRoyale.summonFeatures[this.name.toLowerCase()];

      // Ability modifiers and saves
      const saves = smn.stats?.saves || 0;
      for (let [id, abl] of Object.entries(data.abilities) as [string, any]) {
        abl.total = abl.value;
        abl.mod = Math.floor((abl.total - 10) / 2);
        abl.save = abl.mod + saves;
      }

      // Determine Initiative Modifier
      const init = data.attributes.init;
      init.mod = data.abilities.dex.mod;
      init.total = init.mod + (init?.bonus || 0);
    }
  }

  /* -------------------------------------------- */

  /** @override */
  getRollData() {
    const data = super.getRollData() as any;
    data.classes = this.data.items.reduce((obj: { [x: string]: any }, i: { type: string; name: string; data: any }) => {
      if (i.type === 'class') {
        obj[i.name.slugify({ strict: true })] = i.data;
      }
      return obj;
    }, {});
    data.levels = Object.keys(CONFIG.CarrotRoyale.classFeatures).reduce((a, b) => {
      a[b] = data.classes[b]?.levels || 0;
      return a;
    }, {} as { [key: string]: number });
    //data.prof = this.data.data.attributes.prof || 0;
    data.prof = 0;
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Return the features which a character is awarded for each class level
   * @param {string} className        The class name being added
   * @param {number} level            The number of levels in the added class
   * @param {number} priorLevel       The previous level of the added class
   * @return {Promise<ItemCarRoy[]>}     Array of ItemCarRoy entities
   */
  static async getClassFeatures({ className = '', level = 1, priorLevel = 0 } = {}): Promise<ItemCarRoy[]> {
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

    //console.log(ids);

    const features: ItemCarRoy[] = await Promise.all(
      ids.map(async (id) => {
        //console.log(id);
        let item = await fromUuid(id);
        if (overrides[id]?.level) item.data.data.level = overrides[id].level;
        if (overrides[id]?.uses) item.data.data.uses.limit += overrides[id].uses;
        return item;
      })
    );

    //console.log(features);

    return features;
  }

  /* -------------------------------------------- */

  /** @override */
  async updateEmbeddedEntity(embeddedName: string, data: object | object[], options = {}) {
    console.log('Update Embedded Entity');
    const createItems = embeddedName === 'OwnedItem' ? await this._createClassFeatures(data) : [];
    let updated = await super.updateEmbeddedEntity(embeddedName, data, options);
    if (createItems.length) await this.createEmbeddedEntity('OwnedItem', createItems);
    await this._updateMainClass(data);
    return updated;
  }

  /* -------------------------------------------- */

  /**
   * Create additional class features in the Actor when a class item is updated.
   * @private
   */
  private async _createClassFeatures(updated: any) {
    let toCreate = [];
    for (let u of updated instanceof Array ? updated : [updated]) {
      const item = this.items.get(u._id);
      if (!item || item.data.type !== 'class') continue;
      const updateData = expandObject(u);
      const config = {
        className: updateData.name || item.data.name,
        level: getProperty(updateData, 'data.levels'),
        priorLevel: item ? item.data.data.levels : 0,
      };

      // Get and create features for an increased class level
      let changed = false;
      if (config.level && config.level > config.priorLevel) changed = true;

      // Get features to create
      if (changed) {
        const existing = new Set(this.items.map((i: { name: any }) => i.name));
        const features = await ActorCarRoy.getClassFeatures(config);
        for (let f of features) {
          if (!existing.has(f.name)) {
            if (CONFIG.CarrotRoyale.featureScale.hasOwnProperty(f.name)) {
              const { name, formula } = CONFIG.CarrotRoyale.featureScale[f.name][f.data.data.level] || [f.name, f.data.data.formula];
              let f2: any = duplicate(f);
              [f2.name, f2.data.formula] = [name, formula];
              if (!existing.has(f2.name)) toCreate.push(f2);
            } else toCreate.push(f);
          } else {
            const feature = this.items.find((item: { name: string }) => item.name === f.name);
            if (feature.data.data.level && f.data.data.level && feature.data.data.level < f.data.data.level) {
              if (!CONFIG.CarrotRoyale.featureScale.hasOwnProperty(f.name)) continue;
              const { name, formula } = CONFIG.CarrotRoyale.featureScale[f.name][f.data.data.level] || [f.name, f.data.data.formula];
              let f2: any = duplicate(f);
              [f2.name, f2.data.formula] = [name, formula];
              if (!existing.has(f2.name)) toCreate.push(f2);
            }
          }
        }
      }
    }
    return toCreate;
  }

  /* -------------------------------------------- */

  /**
   * Update Main Class when Class item is updated.
   * @private
   */

  private async _updateMainClass(updated: any) {
    let update = false;
    for (let u of updated instanceof Array ? updated : [updated]) {
      const item = this.items.get(u._id);
      update = update || (!!item && item.data.type === 'class');
    }
    if (update) await prepareMainClass(this);
  }

  /* -------------------------------------------- */
  /*  Data Preparation Helpers                    */
  /* -------------------------------------------- */

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData: any) {
    const data = actorData.data;

    // Determine character level and available hit dice based on owned Class items
    const level = actorData.items.reduce((levels: number, item: any) => {
      if (item.type === 'class') {
        const classLevels = parseInt(item.data.levels) || 1;
        levels += classLevels;
      }
      return levels;
    }, 0);
    data.details.level = level;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /** @override */
  static async create(data: any, options = {}) {
    data.token = data.token || {};
    if (data.type === 'hero') {
      mergeObject(
        data.token,
        {
          displayName: 50,
          vision: true,
          dimSight: 0,
          brightSight: 60,
          actorLink: true,
          disposition: 1,
          displayBars: 50,
          bar1: { attribute: 'attributes.hp' },
        },
        { overwrite: false }
      );
    }
    return super.create(data, options);
  }

  /* -------------------------------------------- */

  /** @override */
  async update(data: object | object[], options = {}) {
    // Reset death save counters
    if (this.data.data.attributes.hp.value <= 0 && getProperty(data, 'data.attributes.hp.value') > 0) {
      setProperty(data, 'data.attributes.death.success', 0);
      setProperty(data, 'data.attributes.death.failure', 0);
    }

    // Perform the update
    return super.update(data, options);
  }

  /* -------------------------------------------- */

  /** @override */
  async createEmbeddedEntity(embeddedName: string, itemData: object | object[], options = {}) {
    // Pre-creation steps for owned items
    //if (embeddedName === 'OwnedItem') this._preCreateOwnedItem(itemData, options);

    // Standard embedded entity creation
    return super.createEmbeddedEntity(embeddedName, itemData, options);
  }

  /* -------------------------------------------- */
  /*  Gameplay Mechanics                          */
  /* -------------------------------------------- */

  /** @override */
  async modifyTokenAttributes(attribute: string, value: number, isDelta: boolean, isBar: boolean): Promise<Actor<any>> {
    if (attribute === 'attributes.hp') {
      const hp = getProperty(this.data.data, attribute);
      const delta = isDelta ? -1 * value : hp.value + hp.temp - value;
      return this.applyDamage(delta);
    }
    return super.modifyTokenAttributes(attribute, value, isDelta, isBar);
  }

  /* -------------------------------------------- */

  /**
   * Apply a certain amount of damage or healing to the health pool for Actor
   * @param {number} amount       An amount of damage (positive) or healing (negative) to sustain
   * @param {number} multiplier   A multiplier which allows for resistance, vulnerability, or healing
   * @return {Promise<Actor>}     A Promise which resolves once the damage has been applied
   */
  async applyDamage(amount = 0, multiplier = 1) {
    amount = Math.floor(parseInt(amount + '') * multiplier);
    const hp = this.data.data.attributes.hp;

    // Deduct damage from temp HP first
    const tmp = parseInt(hp.temp) || 0;
    const dt = amount > 0 ? Math.min(tmp, amount) : 0;

    // Remaining goes to health
    const tmpMax = parseInt(hp.tempmax) || 0;
    const dh = Math.clamped(hp.value - (amount - dt), 0, hp.max + tmpMax);

    // Update the Actor
    const updates = {
      'data.attributes.hp.temp': tmp - dt,
      'data.attributes.hp.value': dh,
    };

    // Delegate damage application to a hook
    const allowed = Hooks.call(
      'modifyTokenAttribute',
      {
        attribute: 'attributes.hp',
        value: amount,
        isDelta: false,
        isBar: true,
      },
      updates
    );
    return allowed !== false ? this.update(updates) : this;
  }

  /* -------------------------------------------- */

  /**
   * Roll a generic ability test or saving throw.
   * Prompt the user for input on which variety of roll they want to do.
   * @param {String}abilityId     The ability id (e.g. "str")
   * @param {Object} options      Options which configure how ability tests or saving throws are rolled
   */
  rollAbility(abilityId: string, options = {}) {
    const label = game.i18n.localize(CONFIG.CarrotRoyale.abilities[abilityId]);
    new Dialog({
      title: game.i18n.format('CarRoy.AbilityPromptTitle', { ability: label }),
      content: `<p>${game.i18n.format('CarRoy.AbilityPromptText', { ability: label })}</p>`,
      buttons: {
        test: {
          label: game.i18n.localize('CarRoy.ActionAbil'),
          callback: () => this.rollAbilityTest(abilityId, options),
        },
        save: {
          label: game.i18n.localize('CarRoy.ActionSave'),
          callback: () => this.rollAbilitySave(abilityId, options),
        },
      },
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Roll an Ability Test
   * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
   * @param {String} abilityId    The ability ID (e.g. "str")
   * @param {Object} options      Options which configure how ability tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  rollAbilityTest(abilityId: string, options: any = {}) {
    const label = game.i18n.localize(CONFIG.CarrotRoyale.abilities[abilityId]);
    const abl = this.data.data.abilities[abilityId];

    // Construct parts
    const parts = ['@mod'];
    const data: any = { mod: abl.save };

    // Add feat-related proficiency bonuses
    const feats = this.data.flags.carroy || {};
    /*if ( feats.remarkableAthlete && CarrotRoyale.characterFlags.remarkableAthlete.abilities.includes(abilityId) ) {
      parts.push("@proficiency");
      data.proficiency = Math.ceil(0.5 * this.data.data.attributes.prof);
    }
    else if ( feats.jackOfAllTrades ) {
      parts.push("@proficiency");
      data.proficiency = Math.floor(0.5 * this.data.data.attributes.prof);
    }*/

    // Add global actor bonus
    const bonuses = getProperty(this.data.data, 'bonuses.abilities') || {};
    if (bonuses.check) {
      parts.push('@checkBonus');
      data.checkBonus = bonuses.check;
    }

    // Add provided extra roll parts now because they will get clobbered by mergeObject below
    if (options.parts?.length > 0) {
      parts.push(...options.parts);
    }

    // Roll and return
    const rollData: any = mergeObject(options, {
      parts: parts,
      data: data as any,
      title: game.i18n.format('CarRoy.AbilityPromptTitle', { ability: label }),
      messageData: { 'flags.carroy.roll': { type: 'ability', abilityId } },
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    return d20Roll(rollData);
  }

  /* -------------------------------------------- */

  /**
   * Roll an Ability Saving Throw
   * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
   * @param {String} abilityId    The ability ID (e.g. "str")
   * @param {Object} options      Options which configure how ability tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  async rollAbilitySave(abilityId: string, options: any = {}) {
    const label = game.i18n.localize(CONFIG.CarrotRoyale.abilities[abilityId]);
    const abl = this.data.data.abilities[abilityId];
    const flags = this.data.data.flags || {};

    // Construct parts
    const parts = ['@mod'];
    const data: any = { mod: abl.mod };

    // Include a global actor ability save bonus
    /*const bonuses = getProperty(this.data.data, 'bonuses.abilities') || {};
    if (bonuses.save) {
      parts.push('@saveBonus');
      data.saveBonus = bonuses.save;
    }*/
    //const raceBonus = this.itemTypes.race.find((item) => item)?.data.data.bonus?.saves;
    /*const race = CONFIG.CarrotRoyale.raceFeatures[this.itemTypes.race.find((item) => item)?.name.toLowerCase() || ''];
    if (race?.bonus?.stats?.saves) {
      parts.push('@saveBonus');
      data.saveBonus = getBonuses(this, 'saves');
      console.log(data.saveBonus);
      /*data.saveBonus = race.bonus?.stats?.saves || 0;
      for (let item of this.items.filter((item: { type: string; }) => ['race', 'class'].includes(item.type))) {
        let bonus = item?.data.data.bonus || {};
        let stat = item.data.bonus
        if (bonus.)
      }
    }*/

    const bonus =
      this.data.type === 'hero'
        ? (await getBonuses(this, 'saves')).number
        : this.data.type === 'summon'
        ? CONFIG.CarrotRoyale.summonFeatures[this.name.toLowerCase()]?.stats?.saves || 0
        : 0;
    //console.log(bonus);
    if (bonus) {
      parts.push('@saveBonus');
      data.saveBonus = bonus;
    }

    // Add provided extra roll parts now because they will get clobbered by mergeObject below
    if (options.parts?.length > 0) {
      parts.push(...options.parts);
    }

    // Roll and return
    const rollData = mergeObject(options, {
      parts: parts,
      data: data,
      title: game.i18n.format('CarRoy.SavePromptTitle', { ability: label }),
      messageData: { 'flags.carroy.roll': { type: 'save', abilityId } },
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    return d20Roll(rollData);
  }

  /* -------------------------------------------- */

  /**
   * Perform a death saving throw, rolling a d20 plus any global save bonuses
   * @param {Object} options        Additional options which modify the roll
   * @return {Promise<Roll|null>}   A Promise which resolves to the Roll instance
   */
  async rollDeathSave(options: any = {}) {
    // Display a warning if we are not at zero HP or if we already have reached 3
    const death = this.data.data.attributes.death;
    if (this.data.data.attributes.hp.value > 0 || death.failure >= 3 || death.success >= 3) {
      ui.notifications.warn(game.i18n.localize('CarRoy.DeathSaveUnnecessary'));
      return null;
    }

    // Evaluate a global saving throw bonus
    const parts = [];
    const data: any = {};
    const speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });

    // Diamond Soul adds proficiency
    /*if (this.getFlag('dnd5e', 'diamondSoul')) {
      parts.push('@prof');
      data.prof = this.data.data.attributes.prof;
    }*/

    // Include a global actor ability save bonus
    const bonuses = getProperty(this.data.data, 'bonuses.abilities') || {};
    if (bonuses.save) {
      parts.push('@saveBonus');
      data.saveBonus = bonuses.save;
    }

    // Evaluate the roll
    const rollData = mergeObject(options, {
      parts: parts,
      data: data,
      title: game.i18n.localize('CarRoy.DeathSavingThrow'),
      speaker: speaker,
      targetValue: 10,
      messageData: { 'flags.carroy.roll': { type: 'death' } },
    });
    rollData.speaker = speaker;
    const roll = await d20Roll(rollData);
    if (!roll) return null;

    // Take action depending on the result
    const success = roll.total >= 10;
    const d20 = roll.dice[0].total;

    // Save success
    if (success) {
      let successes = (death.success || 0) + (d20 === 20 ? 2 : 1);

      // Critical Success = revive with 1hp
      //if (d20 === 20) {
      //successes += 1;
      /*await this.update({
          'data.attributes.death.success': 0,
          'data.attributes.death.failure': 0,
          'data.attributes.hp.value': 1,
        });
        await ChatMessage.create({ content: game.i18n.format('CarRoy.DeathSaveCriticalSuccess', { name: this.name }), speaker });*/
      //successes = Math.clamped(successes + 1, 0, 3);
      //}

      // 3 Successes = survive and reset checks
      if (successes >= 3) {
        await this.update({
          'data.attributes.death.success': 0,
          'data.attributes.death.failure': 0,
          'data.attributes.hp.value': 1,
        });
        await ChatMessage.create({ content: game.i18n.format('CarRoy.DeathSaveSuccess', { name: this.name }), speaker });
      }

      // Increment successes
      else await this.update({ 'data.attributes.death.success': Math.clamped(successes, 0, 3) });
    }

    // Save failure
    else {
      let failures = (death.failure || 0) + (d20 === 1 ? 2 : 1);
      await this.update({ 'data.attributes.death.failure': Math.clamped(failures, 0, 3) });
      if (failures >= 3) {
        // 3 Failures = death
        await ChatMessage.create({ content: game.i18n.format('CarRoy.DeathSaveFailure', { name: this.name }), speaker });
      }
    }

    // Return the rolled result
    return roll;
  }

  /* -------------------------------------------- */
}
