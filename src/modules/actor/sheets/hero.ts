import ActorSheetCarRoy from './base';

/**
 * @extends {ActorSheetCarRoy}
 */
export class HeroSheet extends ActorSheetCarRoy {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carrot-royale', 'actor', 'sheet', 'hero'],
      template: 'systems/carrot-royale/templates/actor/hero-sheet.html',
      width: 600,
      height: 680,
      tabs: [
        {
          navSelector: '.sheet-navigation',
          contentSelector: '.sheet-body',
          initial: 'attributes',
        },
      ],
    });
  }

  /* -------------------------------------------- */

  /**
   * Add some extra data when rendering the sheet to reduce the amount of logic required within the template.
   */
  getData() {
    const sheetData: any = super.getData();

    // Temporary HP
    let hp = sheetData.data.attributes.hp;
    if (hp.temp === 0) delete hp.temp;
    if (hp.tempmax === 0) delete hp.tempmax;

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
          return cls.update({ 'data.levels': next });
        }
      }
    }

    // Default drop handling if levels were not added
    super._onDropItemCreate(itemData);
  }
}
