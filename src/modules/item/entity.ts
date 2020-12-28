import { d20Roll, damageRoll } from '../dice.js';
import AbilityUseDialog from '../apps/ability-use-dialog.js';

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemCarRoy extends Item {
  //labels: Record<string, any>;
  [key: string]: any;

  constructor(...args: [data: EntityData<unknown>, options: any]) {
    super(...args);

    //this.labels = {};
  }

  /**
   * Determine which ability score modifier is used by this item
   * @type {string|null}
   */
  get abilityMod() {
    const itemData = this.data.data;
    if (!('mod' in itemData)) return null;

    // Case 1 - defined directly by the item
    if (itemData.mod) return itemData.mod;
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

  /**
   * Does the Item implement an attack roll as part of its usage
   * @type {boolean}
   */
  get hasAttack() {
    return ['mAttack', 'rAttack', 'sAttack'].includes(this.data.data.action);
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement a damage roll as part of its usage
   * @type {boolean}
   */
  get hasDamage() {
    return !!this.data.data.formula;
  }

  /* -------------------------------------------- */

  /**
   * Does the item provide an amount of healing instead of conventional damage?
   * @return {boolean}
   */
  get isHealing() {
    return this.data.data.actionType === 'healing' && this.data.data.damage.formula;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item implement a saving throw as part of its usage
   * @type {boolean}
   */
  get hasSave() {
    const save = this.data.data?.save || {};
    return !!save.ability;
  }

  /* -------------------------------------------- */

  /**
   * Does the Item have a target
   * @type {boolean}
   */
  get hasTarget() {
    const target = this.data.data.target;
    return target && !['none', ''].includes(target.type);
  }

  /* -------------------------------------------- */

  /**
   * Does the Item have an area of effect target
   * @type {boolean}
   */
  get hasAreaTarget() {
    const target = this.data.data.target;
    return target && target.type && target.type in CONFIG.CarrotRoyale.areaTargetTypes;
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
    const labels: Record<string, any> = (this.labels = {});

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
      labels.target = [tgt.value, game.i18n.localize(C.distanceUnits[tgt.units]), game.i18n.localize(C.targetTypes[tgt.type])].filterJoin(' ');

      //Range Label
      let rng = data.range || {};
      if (['none', 'touch', 'Self'].includes(rng.units) || rng.value === 0) rng.value = null;
      labels.range = [rng.value, game.i18n.localize(C.distanceUnits[rng.units])].filterJoin(' ');

      //Duration Label
      let dur = data.duration || {};
    }

    //Item Actions
    if (data.hasOwnProperty('action')) {
      // Saving throws
      this.getSaveDC();

      // Damage
      let dam = data.damage || {};
      if (dam.parts) {
        labels.damage = dam.parts
          .map((d: any[]) => d[0])
          .join(' + ')
          .replace(/\+ -/g, '- ');
        labels.damageTypes = dam.parts.map((d: (string | number)[]) => C.damageTypes[d[1]]).join(', ');
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Update the derived spell DC for an item that requires a saving throw
   * @returns {number|null}
   */
  getSaveDC(): number | null | undefined {
    if (!this.hasSave) return;
    const save = this.data.data?.save;

    // Actor spell-DC based scaling
    /*if (save.scaling === 'spell') {
      save.dc = this.isOwned ? getProperty(this.actor?.data, 'data.attributes.spelldc') : null;
    }*/

    // Ability-score based scaling
    /*if (save.scaling !== 'flat') {
      save.dc = this.isOwned ? getProperty(this.actor?.data as object, `data.abilities.${save.scaling}.dc`) : null;
    }*/

    // Update labels
    const abl = game.i18n.localize(CONFIG.CarrotRoyale.abilities[save.ability]);

    this.labels.save = game.i18n.format('CarRoy.SaveDC', { dc: save.dc || '', ability: abl });
    return save.dc;
  }

  /* -------------------------------------------- */

  /**
   * Roll the item to Chat, creating a chat card which contains follow up attack or damage roll options
   * @param {boolean} [configureDialog]     Display a configuration dialog for the item roll, if applicable?
   * @param {string} [rollMode]             The roll display mode with which to display (or not) the card
   * @param {boolean} [createMessage]       Whether to automatically create a chat message (if true) or simply return
   *                                        the prepared chat message data (if false).
   * @return {Promise<ChatMessage|object|void>}
   */
  async roll({
    configureDialog = true,
    rollMode,
    createMessage = true,
  }: { configureDialog?: boolean; rollMode?: string; createMessage?: boolean } = {}): Promise<ChatMessage | object | void> {
    let item = this;
    const actor = this.actor;

    // Reference aspects of the item data necessary for usage
    const id = this.data.data; // Item data
    const hasArea = this.hasAreaTarget; // Is the ability usage an AoE?
    //const resource = id.consume || {}; // Resource consumption
    //const recharge = id.recharge || {}; // Recharge mechanic
    //const uses = id?.uses ?? {}; // Limited uses
    const isSpell = this.type === 'spell'; // Does the item require a spell slot?
    //const requireSpellSlot = isSpell && id.level > 0 && CONFIG.CarrotRoyale.spellUpcastModes.includes(id.preparation.mode);

    // Define follow-up actions resulting from the item usage
    let createMeasuredTemplate = hasArea; // Trigger a template creation
    //let consumeRecharge = !!recharge.value; // Consume recharge
    //let consumeResource = !!resource.target && resource.type !== 'ammo'; // Consume a linked (non-ammo) resource
    //let consumeSpellSlot = requireSpellSlot; // Consume a spell slot
    //let consumeUsage = !!uses.per; // Consume limited uses
    //let consumeQuantity = uses.autoDestroy; // Consume quantity of the item in lieu of uses

    // Display a configuration dialog to customize the usage
    const needsConfiguration = createMeasuredTemplate; // || consumeRecharge || consumeResource || consumeSpellSlot || consumeUsage;
    if (configureDialog && needsConfiguration) {
      const configuration = await AbilityUseDialog.create(this);
      if (!configuration) return;

      // Determine consumption preferences
      //createMeasuredTemplate = Boolean(configuration.placeTemplate);
      //consumeUsage = Boolean(configuration.consumeUse);
      //consumeRecharge = Boolean(configuration.consumeRecharge);
      //consumeResource = Boolean(configuration.consumeResource);
      //consumeSpellSlot = Boolean(configuration.consumeSlot);

      // Handle spell upcasting
      /*if (requireSpellSlot) {
        const slotLevel = configuration.level;
        const spellLevel = slotLevel === 'pact' ? actor.data.data.spells.pact.level : parseInt(slotLevel);
        if (spellLevel !== id.level) {
          const upcastData = mergeObject(this.data, { 'data.level': spellLevel }, { inplace: false });
          item = this.constructor.createOwned(upcastData, actor); // Replace the item with an upcast version
        }
        if (consumeSpellSlot) consumeSpellSlot = slotLevel === 'pact' ? 'pact' : `spell${spellLevel}`;
      }*/
    }

    // Determine whether the item can be used by testing for resource consumption
    //const usage = item._getUsageUpdates({ consumeRecharge, consumeResource, consumeSpellSlot, consumeUsage, consumeQuantity });
    //if (!usage) return;
    //const { actorUpdates, itemUpdates, resourceUpdates } = usage;

    // Commit pending data updates
    //if (!isObjectEmpty(itemUpdates)) await item.update(itemUpdates);
    //if (consumeQuantity && item.data.data.quantity === 0) await item.delete();
    //if (!isObjectEmpty(actorUpdates)) await actor.update(actorUpdates);
    /*if (!isObjectEmpty(resourceUpdates)) {
      const resource = actor.items.get(id.consume?.target);
      if (resource) await resource.update(resourceUpdates);
    }*/

    // Initiate measured template creation
    /*if (createMeasuredTemplate) {
      const template = game.carroy.canvas.AbilityTemplate.fromItem(item);
      if (template) template.drawPreview();
    }*/

    // Create or return the Chat Message data
    return item.displayCard({ rollMode, createMessage });
  }

  /* -------------------------------------------- */

  /**
   * Display the chat card for an Item as a Chat Message
   * @param {object} options          Options which configure the display of the item chat card
   * @param {string} rollMode         The message visibility mode to apply to the created card
   * @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
   *                                  the prepared message data (if false)
   */
  async displayCard({ rollMode, createMessage = true }: { rollMode?: string; createMessage?: boolean } = {}) {
    // Basic template rendering data
    const token = this.actor?.token;
    const templateData = {
      actor: this.actor,
      tokenId: token ? `${token.scene._id}.${token.id}` : null,
      item: this.data,
      data: this.getChatData(),
      labels: this.labels,
      hasAttack: this.hasAttack,
      isHealing: this.isHealing,
      hasDamage: this.hasDamage,
      //isVersatile: this.isVersatile,
      isSpell: this.data.type === 'spell',
      hasSave: this.hasSave,
      hasAreaTarget: this.hasAreaTarget,
    };

    // Render the chat card template
    const templateType = ['tool'].includes(this.data.type) ? this.data.type : 'item';
    const template = `systems/carroy/templates/chat/${templateType}-card.html`;
    const html = await renderTemplate(template, templateData);

    // Create the ChatMessage data object
    const chatData: ChatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      flavor: this.data.data.chatFlavor || this.name,
      speaker: ChatMessage.getSpeaker({ actor: this.actor ?? undefined, token }),
      flags: { 'core.canPopout': true },
    };

    // If the Item was destroyed in the process of displaying its card - embed the item data in the chat message
    if (this.data.type === 'consumable' && !this.actor?.items.has(this.id)) {
      chatData.flags['carroy.itemData'] = this.data;
    }

    // Apply the roll mode to adjust message visibility
    ChatMessage.applyRollMode(chatData, rollMode || game.settings.get('core', 'rollMode'));

    // Create the Chat Message or return its data
    return createMessage ? ChatMessage.create(chatData) : chatData;
  }

  /* -------------------------------------------- */
  /*  Chat Cards																	*/
  /* -------------------------------------------- */

  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @param {Object} htmlOptions    Options used by the TextEditor.enrichHTML function
   * @return {Object}               An object of chat data to render
   */
  getChatData(htmlOptions = {}) {
    const data = duplicate(this.data.data);
    const labels = this.labels;

    // Rich text description
    data.description = TextEditor.enrichHTML(data.description.value, htmlOptions);

    // Item type specific properties
    const props: any[] = [];
    const fn = this[`_${this.data.type}ChatData`];
    if (fn) fn.bind(this)(data, labels, props);

    // Equipment properties
    if (data.hasOwnProperty('equipped')) {
      props.push(game.i18n.localize(data.equipped ? 'CarRoy.Equipped' : 'CarRoy.Unequipped'));
    }

    // Ability activation properties
    if (data.hasOwnProperty('activation')) {
      props.push(labels.activation + (data.activation?.condition ? ` (${data.activation.condition})` : ''), labels.target, labels.range, labels.duration);
    }

    // Filter properties and return
    data.properties = props.filter((p) => !!p);
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for equipment type items
   * @private
   */
  _equipmentChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(
      CONFIG.CarrotRoyale.equipmentTypes[data.armor.type],
      labels.armor || null,
      data.stealth.value ? game.i18n.localize('CarRoy.StealthDisadvantage') : null
    );
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for weapon type items
   * @private
   */
  _weaponChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(game.i18n.localize(CONFIG.CarrotRoyale.weaponTypes[data.weaponType]));
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for consumable type items
   * @private
   */
  _consumableChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(CONFIG.CarrotRoyale.consumableTypes[data.consumableType], data.uses.value + '/' + data.uses.max + ' ' + game.i18n.localize('CarRoy.Charges'));
    data.hasCharges = data.uses.value >= 0;
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for tool type items
   * @private
   */
  _toolChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(CONFIG.CarrotRoyale.abilities[data.ability] || null, CONFIG.CarrotRoyale.proficiencyLevels[data.proficient || 0]);
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for tool type items
   * @private
   */
  _lootChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(game.i18n.localize('CarRoy.ItemTypeLoot'), data.weight ? data.weight + ' ' + game.i18n.localize('CarRoy.AbbreviationLbs') : null);
  }

  /* -------------------------------------------- */

  /**
   * Render a chat card for Spell type data
   * @return {Object}
   * @private
   */
  _spellChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(labels.level, labels.components + (labels.materials ? ` (${labels.materials})` : ''));
  }

  /* -------------------------------------------- */

  /**
   * Prepare chat card data for items of the "Feat" type
   * @private
   */
  _featChatData(data: any, labels: Record<string, any>, props: any[]) {
    props.push(data.requirements);
  }

  /* -------------------------------------------- */
  /*  Item Rolls - Attack, Damage, Saves, Checks  */
  /* -------------------------------------------- */

  /**
   * Place an attack roll using an item (weapon, feat, spell, or equipment)
   * Rely upon the d20Roll logic for the core implementation
   *
   * @param {object} options        Roll options which are configured and provided to the d20Roll function
   * @return {Promise<Roll|null>}   A Promise which resolves to the created Roll instance
   */
  async rollAttack(options: Record<string, any> = {}): Promise<Roll | null> {
    const itemData = this.data.data;
    const actorData = this.actor?.data.data;
    const flags = this.actor?.data.flags.carroy || {};
    if (!this.hasAttack) {
      throw new Error('You may not place an Attack Roll with this Item.');
    }
    let title = `${this.name} - ${game.i18n.localize('CarRoy.AttackRoll')}`;
    const rollData = this.getRollData();

    // Define Roll bonuses
    const parts = [`@mod`];
    if (!['weapon', 'consumable'].includes(this.data.type) || itemData.proficient) {
      parts.push('@prof');
    }

    // Attack Bonus
    if (itemData.attackBonus) parts.push(itemData.attackBonus);
    const actorBonus = actorData?.bonuses?.[itemData.actionType] || {};
    if (actorBonus.attack) parts.push(actorBonus.attack);

    // Ammunition Bonus
    /*delete this._ammo;
    let ammo = null;
    let ammoUpdate = null;
    const consume = itemData.consume;
    if (consume?.type === 'ammo') {
      ammo = this.actor?.items.get(consume.target);
      if (ammo?.data) {
        const q = ammo.data.data.quantity;
        const consumeAmount = consume.amount ?? 0;
        if (q && q - consumeAmount >= 0) {
          this._ammo = ammo;
          let ammoBonus = ammo.data.data.attackBonus;
          if (ammoBonus) {
            parts.push('@ammo');
            rollData['ammo'] = ammoBonus;
            title += ` [${ammo.name}]`;
          }
        }
      }

      // Get pending ammunition update
      const usage = this._getUsageUpdates({ consumeResource: true });
      if (usage === false) return null;
      ammoUpdate = usage.resourceUpdates || {};
    }*/

    // Compose roll options
    const rollConfig = mergeObject(
      {
        parts: parts,
        actor: this.actor,
        data: rollData,
        title: title,
        flavor: title,
        speaker: ChatMessage.getSpeaker({ actor: this.actor ?? undefined }),
        dialogOptions: {
          width: 400,
          top: options.event ? options.event.clientY - 80 : null,
          left: window.innerWidth - 710,
        },
        messageData: { 'flags.carroy.roll': { type: 'attack', itemId: this.id } },
      },
      options
    );
    rollConfig.event = options.event;

    // Expanded critical hit thresholds
    if (this.data.type === 'weapon' && flags.weaponCriticalThreshold) {
      rollConfig.critical = parseInt(flags.weaponCriticalThreshold);
    } else if (this.data.type === 'spell' && flags.spellCriticalThreshold) {
      rollConfig.critical = parseInt(flags.spellCriticalThreshold);
    }

    // Elven Accuracy
    /*if (['weapon', 'spell'].includes(this.data.type)) {
      if (flags.elvenAccuracy && ['dex', 'int', 'wis', 'cha'].includes(this.abilityMod)) {
        rollConfig.elvenAccuracy = true;
      }
    }

    // Apply Halfling Lucky
    if (flags.halflingLucky) rollConfig.halflingLucky = true;*/

    // Invoke the d20 roll helper
    const roll = await d20Roll(rollConfig);
    //if (!roll) return null;

    // Commit ammunition consumption on attack rolls resource consumption if the attack roll was made
    //if (ammo && !isObjectEmpty(ammoUpdate)) await ammo.update(ammoUpdate);
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Place a damage roll using an item (weapon, feat, spell, or equipment)
   * Rely upon the damageRoll logic for the core implementation.
   * @param {MouseEvent} [event]    An event which triggered this roll, if any
   * @param {boolean} [critical]    Should damage be rolled as a critical hit?
   * @param {number} [spellLevel]   If the item is a spell, override the level for damage scaling
   * @param {boolean} [versatile]   If the item is a weapon, roll damage using the versatile formula
   * @param {object} [options]      Additional options passed to the damageRoll function
   * @return {Promise<Roll>}        A Promise which resolves to the created Roll instance
   */
  rollDamage({ critical = false, event = null, options = {} }: DamageRoll = {}) {
    if (!this.hasDamage) throw new Error('You may not make a Damage Roll with this Item.');
    const itemData = this.data.data;
    const actorData = this.actor?.data.data;
    const messageData = { 'flags.carroy.roll': { type: 'damage', itemId: this.id } };

    // Get roll data
    //const parts = itemData.damage.parts.map((d: string[]) => d[0]);
    const parts = [itemData.formula];
    const rollData = this.getRollData();
    //if (spellLevel) rollData.item.level = spellLevel;

    // Configure the damage roll
    const title = `${this.name} - ${game.i18n.localize('CarRoy.DamageRoll')}`;
    const rollConfig: Record<string, any> = {
      actor: this.actor,
      critical: critical ?? event?.altKey ?? false,
      data: rollData,
      event: event,
      fastForward: event ? event?.shiftKey || event?.altKey || event?.ctrlKey || event?.metaKey : false,
      parts: parts,
      title: title,
      flavor: this.labels.damageTypes?.length ? `${title} (${this.labels.damageTypes})` : title,
      speaker: ChatMessage.getSpeaker({ actor: this.actor ?? undefined }),
      dialogOptions: {
        width: 400,
        top: event ? event.clientY - 80 : null,
        left: window.innerWidth - 710,
      },
      messageData: messageData,
    };

    // Adjust damage from versatile usage
    /*if (versatile && itemData.damage.versatile) {
      parts[0] = itemData.damage.versatile;
      messageData['flags.carroy.roll'].versatile = true;
    }*/

    // Scale damage from up-casting spells
    if (this.data.type === 'spell') {
      /*if (itemData.scaling.mode === 'cantrip') {
        const level = this.actor.data.type === 'character' ? actorData.details.level : actorData.details.spellLevel;
        this._scaleCantripDamage(parts, itemData.scaling.formula, level, rollData);
      } else if (spellLevel && itemData.scaling.mode === 'level' && itemData.scaling.formula) {
        const scaling = itemData.scaling.formula;
        this._scaleSpellDamage(parts, itemData.level, spellLevel, scaling, rollData);
      }*/
    }

    // Add damage bonus formula
    const actorBonus = getProperty(actorData, `bonuses.${itemData.actionType}`) || {};
    if (actorBonus.damage && parseInt(actorBonus.damage) !== 0) {
      parts.push(actorBonus.damage);
    }

    // Add ammunition damage
    /*if (this._ammo) {
      parts.push('@ammo');
      rollData['ammo'] = this._ammo.data.data.damage.parts.map((p) => p[0]).join('+');
      rollConfig.flavor += ` [${this._ammo.name}]`;
      delete this._ammo;
    }*/

    // Scale melee critical hit damage
    if (itemData.actionType === 'mwak') {
      rollConfig.criticalBonusDice = this.actor?.getFlag('carroy', 'meleeCriticalDamageDice') ?? 0;
    }

    // Call the roll helper utility
    return damageRoll(mergeObject(rollConfig, options));
  }

  /* -------------------------------------------- */

  /**
   * Place an attack roll using an item (weapon, feat, spell, or equipment)
   * Rely upon the d20Roll logic for the core implementation
   *
   * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
   */
  async rollFormula(options = {}): Promise<Roll> {
    if (!this.data.data.formula) {
      throw new Error('This Item does not have a formula to roll!');
    }

    // Define Roll Data
    const rollData = this.getRollData();
    //if (options.spellLevel) rollData.item.level = options.spellLevel;
    const title = `${this.name} - ${game.i18n.localize('CarRoy.OtherFormula')}`;

    // Invoke the roll and submit it to chat
    const roll = new Roll(rollData.item.formula, rollData).roll();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor || undefined }),
      flavor: title,
      rollMode: game.settings.get('core', 'rollMode'),
      messageData: { 'flags.carroy.roll': { type: 'other', itemId: this.id } },
    });
    return roll;
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = duplicate(this.data.data);

    // Include an ability score modifier if one exists
    const abl = this.abilityMod;
    if (abl) {
      const ability = rollData.abilities[abl];
      rollData['mod'] = ability.mod || 0;
    }

    // Include a proficiency score
    const prof = 'proficient' in rollData.item ? rollData.item.proficient || 0 : 1;
    rollData['prof'] = Math.floor(prof * (rollData.attributes.prof || 0));
    return rollData;
  }

  /* -------------------------------------------- */
  /*  Chat Message Helpers                        */
  /* -------------------------------------------- */

  static chatListeners(html: any) {
    html.on('click', '.card-buttons button', this._onChatCardAction.bind(this));
    html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle execution of a chat card action via a click event on one of the card buttons
   * @param {Event} event       The originating click event
   * @returns {Promise}         A promise which resolves once the handler workflow is complete
   * @private
   */
  static async _onChatCardAction(event: KeyboardEvent) {
    event.preventDefault();

    // Extract card data
    const button = event.currentTarget as (EventTarget | null) & { [key: string]: any };
    button.disabled = true;
    const card = button.closest('.chat-card');
    const messageId = card.closest('.message').dataset.messageId;
    const message = game.messages.get(messageId);
    const action = button.dataset.action;

    // Validate permission to proceed with the roll
    const isTargetted = action === 'save';
    if (!(isTargetted || game.user.isGM || message.isAuthor)) return;

    // Recover the actor for the chat card
    const actor = this._getChatCardActor(card);
    if (!actor) return;

    // Get the Item from stored flag data or by the item ID on the Actor
    const storedData = message.getFlag('carroy', 'itemData');
    const item = (storedData ? this.createOwned(storedData, actor) : actor.getOwnedItem(card.dataset.itemId)) as ItemCarRoy | null;
    if (!item) {
      return ui.notifications.error(game.i18n.format('CarRoy.ActionWarningNoItem', { item: card.dataset.itemId, name: actor.name }));
    }
    const spellLevel = parseInt(card.dataset.spellLevel) || null;

    // Handle different actions
    switch (action) {
      case 'attack':
        await item.rollAttack({ event });
        break;
      case 'damage':
      case 'versatile':
        await item.rollDamage({
          critical: event.altKey,
          event: event,
        });
        break;
      case 'formula':
        await item.rollFormula({ event, spellLevel });
        break;
      case 'save':
        const targets = this._getChatCardTargets(card);
        for (let token of targets) {
          const speaker = ChatMessage.getSpeaker({ scene: canvas.scene, token: token });
          await token.actor.rollAbilitySave(button.dataset.ability, { event, speaker });
        }
        break;
      /*case 'toolCheck':
        await item.rollToolCheck({ event });
        break;*/
      case 'placeTemplate':
        const template = game.carroy.canvas.AbilityTemplate.fromItem(item);
        if (template) template.drawPreview();
        break;
    }

    // Re-enable the button
    button.disabled = false;
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling the visibility of chat card content when the name is clicked
   * @param {Event} event   The originating click event
   * @private
   */
  static _onChatCardToggleContent(event: Event) {
    event.preventDefault();
    const header = event.currentTarget as (EventTarget | null) & { [key: string]: any };
    const card = header.closest('.chat-card');
    const content = card.querySelector('.card-content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  }

  /* -------------------------------------------- */

  /**
   * Get the Actor which is the author of a chat card
   * @param {HTMLElement} card    The chat card being used
   * @return {Actor|null}         The Actor entity or null
   * @private
   */
  static _getChatCardActor(card: HTMLElement) {
    // Case 1 - a synthetic actor from a Token
    const tokenKey = card.dataset.tokenId;
    if (tokenKey) {
      const [sceneId, tokenId] = tokenKey.split('.');
      const scene = game.scenes.get(sceneId);
      if (!scene) return null;
      const tokenData = scene.getEmbeddedEntity('Token', tokenId);
      if (!tokenData) return null;
      const token = new Token(tokenData);
      return token.actor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId ?? '';
    return game.actors.get(actorId) || null;
  }

  /* -------------------------------------------- */

  /**
   * Get the Actor which is the author of a chat card
   * @param {HTMLElement} card    The chat card being used
   * @return {Array.<Actor>}      An Array of Actor entities, if any
   * @private
   */
  static _getChatCardTargets(card: HTMLElement) {
    let targets = canvas.tokens.controlled.filter((t: { actor: any }) => !!t.actor);
    if (!targets.length && game.user.character) targets = targets.concat(game.user.character.getActiveTokens());
    if (!targets.length) ui.notifications.warn(game.i18n.localize('CarRoy.ActionWarningNoToken'));
    return targets;
  }
}
