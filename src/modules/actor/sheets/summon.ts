import ActorClassConfig from '../../apps/class-config.js';
import { prepareMainClass } from '../../utils.js';
import ActorCarRoy from '../entity.js';
import ActorSheetCarRoy from './base.js';

/**
 * @extends {ActorSheetCarRoy}
 */
export class SummonSheet extends ActorSheetCarRoy {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['carroy', 'actor', 'sheet', 'summon'],
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

    // Return data for rendering
    return sheetData;
  }

  _prepareItems(data: any) {}

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
      case 'rollDeathSave':
        return (this.actor as ActorCarRoy).rollDeathSave({ event: event });
      case 'rollInitiative':
        return ((this.actor as unknown) as { rollInitiative: (...args: any) => unknown }).rollInitiative({ createCombatants: true });
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDropItemCreate(itemData: any) {
    // Increment the number of class levels a character instead of creating a new item
    return;

    // Default drop handling if levels were not added
    // await super._onDropItemCreate(itemData);
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  /** @override */
  _getSubmitData(updateData = {}) {
    // Create the expanded update data object
    const fd = new FormDataExtended(this.form as HTMLElement, { editors: this.editors });
    let data = fd.toObject();
    if (updateData) data = mergeObject(data, updateData);
    else data = expandObject(data);

    data.data.team = parseInt(data.data.team);

    // Return the flattened submission data
    return flattenObject(data);
  }
}
