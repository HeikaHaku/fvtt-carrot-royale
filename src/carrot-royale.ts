import { CarrotRoyale } from './modules/config.js';
import { registerSystemSettings } from './modules/settings.js';

import { HeroSheet } from './modules/actor/hero-sheet.js';

export const log = (...args: unknown[]) => console.log('Carrot Royale | ' + args);

Hooks.once('init', function () {
  console.log(`Carrot Royale | Initializing the Carrot Royale Game System.`);

  //Create the Namespace
  game.carroy = {
    applications: {},
    canvas: {},
    config: CarrotRoyale,
    dice: {},
    entities: {},
    macros: {},
    migrations: {},
    rollItemMacro: {},
  };

  //Record Configuration
  CONFIG.CarrotRoyale = CarrotRoyale;

  //Register System Settings
  registerSystemSettings();

  //Register Sheets
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('carroy', HeroSheet, {
    types: ['hero'],
    makeDefault: true,
    label: 'CarRoy.SheetClassHero',
  });
});

Hooks.once('setup', function () {
  //Localize CONFIG objects
  const toLocalize: string[] = [];

  //Exclude from Sorting
  const noSort: string[] = [];

  //localize and sort CONFIG objects
  for (let o of toLocalize) {
    const localized = Object.entries(CONFIG.CarrotRoyale[o]).map((e) => {
      return [e[0], game.i18n.localize(e[1] as string)];
    });
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.CarrotRoyale[o] = localized.reduce((obj: { [key: string]: string }, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {});
  }
});
