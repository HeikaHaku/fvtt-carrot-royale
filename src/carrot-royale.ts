import { CarrotRoyale } from './modules/config.js';
import { registerSystemSettings } from './modules/settings.js';

import { HeroSheet } from './modules/actor/hero-sheet.js';

import { ArmorSheet } from './modules/item/armor-sheet.js';
import { ClassSheet } from './modules/item/class-sheet.js';
import { EnchantmentSheet } from './modules/item/enchantment-sheet.js';
import { FeatureSheet } from './modules/item/feature-sheet.js';
import { MagicItemSheet } from './modules/item/magic-item-sheet.js';
import { RaceSheet } from './modules/item/race-sheet.js';
import { SpellSheet } from './modules/item/spell-sheet.js';
import { WeaponSheet } from './modules/item/weapon-sheet.js';

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

  Items.registerSheet('carroy', ArmorSheet, {
    types: ['armor'],
    makeDefault: true,
    label: 'CarRoy.SheetClassArmor',
  });

  Items.registerSheet('carroy', ClassSheet, {
    types: ['class'],
    makeDefault: true,
    label: 'CarRoy.SheetClassClass',
  });

  Items.registerSheet('carroy', EnchantmentSheet, {
    types: ['enchantment'],
    makeDefault: true,
    label: 'CarRoy.SheetClassEnchantment',
  });

  Items.registerSheet('carroy', FeatureSheet, {
    types: ['feature'],
    makeDefault: true,
    label: 'CarRoy.SheetClassFeature',
  });

  Items.registerSheet('carroy', MagicItemSheet, {
    types: ['magic'],
    makeDefault: true,
    label: 'CarRoy.SheetClassMagicItem',
  });

  Items.registerSheet('carroy', RaceSheet, {
    types: ['race'],
    makeDefault: true,
    label: 'CarRoy.SheetClassRace',
  });

  Items.registerSheet('carroy', SpellSheet, {
    types: ['spell'],
    makeDefault: true,
    label: 'CarRoy.SheetClassSpell',
  });

  Items.registerSheet('carroy', WeaponSheet, {
    types: ['weapon'],
    makeDefault: true,
    label: 'CarRoy.SheetClassWeapon',
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
