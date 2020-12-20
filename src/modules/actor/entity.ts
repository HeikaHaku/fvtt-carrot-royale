import { CarrotRoyale } from '../config.js';

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
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.carRoy || {};
    const bonuses = getProperty(data, 'bonuses.abilities') || {};

    // Ability modifiers and saves
    for (let [id, abl] of Object.entries(data.abilities) as [string, any]) {
      abl.mod = Math.floor((abl.value - 10) / 2);
    }

    // Determine Initiative Modifier
    const init = data.attributes.init;
    init.mod = data.abilities.dex.mod;
    init.total = init.mod + init.bonus;
  }

  /* -------------------------------------------- */

  /** @override */
  /*async updateEmbeddedEntity(embeddedName: string, data: object | object[], options = {}) {
    const createItems = embeddedName === 'OwnedItem' ? await this._createClassFeatures(data) : [];
    let updated = await super.updateEmbeddedEntity(embeddedName, data, options);
    if (createItems.length) await this.createEmbeddedEntity('OwnedItem', createItems);
    return updated;
  }*/

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
    const label = CONFIG.CarrotRoyale.abilities[abilityId];
    new Dialog({
      title: game.i18n.format('CarRoy.AbilityPromptTitle', { ability: label }),
      content: `<p>${game.i18n.format('DND5E.AbilityPromptText', { ability: label })}</p>`,
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
    const label = CONFIG.CarrotRoyale.abilities[abilityId];
    const abl = this.data.data.abilities[abilityId];

    // Construct parts
    const parts = ['@mod'];
    const data: any = { mod: abl.mod };

    // Add feat-related proficiency bonuses
    const feats = this.data.flags.carRoy || {};
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
      messageData: { 'flags.carRoy.roll': { type: 'ability', abilityId } },
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    //return d20Roll(rollData);
  }

  /* -------------------------------------------- */

  /**
   * Roll an Ability Saving Throw
   * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
   * @param {String} abilityId    The ability ID (e.g. "str")
   * @param {Object} options      Options which configure how ability tests are rolled
   * @return {Promise<Roll>}      A Promise which resolves to the created Roll instance
   */
  rollAbilitySave(abilityId: string, options: any = {}) {
    const label = CONFIG.DND5E.abilities[abilityId];
    const abl = this.data.data.abilities[abilityId];

    // Construct parts
    const parts = ['@mod'];
    const data: any = { mod: abl.mod };

    // Include a global actor ability save bonus
    const bonuses = getProperty(this.data.data, 'bonuses.abilities') || {};
    if (bonuses.save) {
      parts.push('@saveBonus');
      data.saveBonus = bonuses.save;
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
      messageData: { 'flags.carRoy.roll': { type: 'save', abilityId } },
    });
    rollData.speaker = options.speaker || ChatMessage.getSpeaker({ actor: this });
    //return d20Roll(rollData);
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
    if (this.getFlag('dnd5e', 'diamondSoul')) {
      parts.push('@prof');
      data.prof = this.data.data.attributes.prof;
    }

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
      messageData: { 'flags.carRoy.roll': { type: 'death' } },
    });
    rollData.speaker = speaker;
    const roll: any = {}; //await d20Roll(rollData);
    if (!roll) return null;

    // Take action depending on the result
    const success = roll.total >= 10;
    const d20 = roll.dice[0].total;

    // Save success
    if (success) {
      let successes = (death.success || 0) + 1;

      // Critical Success = revive with 1hp
      if (d20 === 20) {
        await this.update({
          'data.attributes.death.success': 0,
          'data.attributes.death.failure': 0,
          'data.attributes.hp.value': 1,
        });
        await ChatMessage.create({ content: game.i18n.format('CarRoy.DeathSaveCriticalSuccess', { name: this.name }), speaker });
      }

      // 3 Successes = survive and reset checks
      else if (successes === 3) {
        await this.update({
          'data.attributes.death.success': 0,
          'data.attributes.death.failure': 0,
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