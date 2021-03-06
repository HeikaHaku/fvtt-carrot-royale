import { CarrotRoyale } from './modules/config.js';
import { registerSystemSettings } from './modules/settings.js';
import { preloadHandlebarsTemplates } from './modules/templates.js';

import ActorCarRoy from './modules/actor/entity.js';
import { HeroSheet } from './modules/actor/sheets/hero.js';

import ItemCarRoy from './modules/item/entity.js';
import ItemSheetCarRoy from './modules/item/sheet.js';

import * as chat from './modules/chat.js';
import * as dice from './modules/dice.js';
import * as migrations from './modules/migrations.js';
import { _getInitiativeFormula } from './modules/combat.js';
import { SummonSheet } from './modules/actor/sheets/summon.js';

export const log = (...args: unknown[]) => console.log('Carrot Royale | ' + args);

Hooks.once('init', function () {
  console.log(`Carrot Royale | Initializing the Carrot Royale Game System.`);

  //Create the Namespace
  game.carroy = {
    applications: {},
    canvas: {},
    config: CarrotRoyale,
    dice: dice,
    entities: {
      ActorCarRoy,
      ItemCarRoy,
    },
    macros: {},
    migrations: migrations,
    rollItemMacro: {},
  };

  //Record Configuration
  CONFIG.CarrotRoyale = CarrotRoyale;
  CONFIG.Actor.entityClass = ActorCarRoy;
  CONFIG.Item.entityClass = ItemCarRoy;

  //Register System Settings
  registerSystemSettings();

  // Patch Core Functions
  CONFIG.Combat.initiative.formula = '1d20 + @attributes.init.mod + @attributes.init.prof + @attributes.init.bonus';
  Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  //Register Sheets
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('carroy', HeroSheet, {
    types: ['hero'],
    makeDefault: true,
    label: 'CarRoy.SheetClassHero',
  });

  Actors.registerSheet('carroy', SummonSheet, {
    types: ['summon'],
    makeDefault: true,
    label: 'CarRoy.SheetClassSummon',
  });

  /*Items.registerSheet('carroy', ArmorSheet, {
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
  });*/

  //Items.unregisterSheet('core', 'Item');
  Items.registerSheet('carroy', ItemSheetCarRoy, {
    makeDefault: true,
    label: 'CarRoy.SheetClassItem',
  });

  preloadHandlebarsTemplates();
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

/* -------------------------------------------- */

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  //Hooks.on('hotbarDrop', (bar: any, data: any, slot: any) => macros.create5eMacro(data, slot));

  // Determine whether a system migration is required and feasible
  if (!game.user?.isGM) return;
  const _cv = game.settings.get('carroy', 'systemMigrationVersion');
  const currentVersion = isNaN(_cv) ? game.system.data.version : _cv;
  const NEEDS_MIGRATION_VERSION = '0.4.6';
  const COMPATIBLE_MIGRATION_VERSION = '0.0.2';
  const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if (!needsMigration) return;

  // Perform the migration
  if (currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion)) {
    const warning = `Your Carrot Royale system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
    ui.notifications?.error(warning, { permanent: true });
  }
  migrations.migrateWorld();
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on('renderChatMessage', (app: ChatMessage, html: JQuery, data: Record<string, any>) => {
  // Display action buttons
  chat.displayChatActionButtons(app, html, data);

  // Highlight critical success or failure die
  chat.highlightCriticalSuccessFailure(app, html, data);

  // Optionally collapse the content
  //if (game.settings.get('carroy', 'autoCollapseItemCards')) html.find('.card-content').hide();
});
Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
Hooks.on('renderChatLog', (app: any, html: any, data: any) => ItemCarRoy.chatListeners(html));
Hooks.on('renderChatPopout', (app: any, html: any, data: any) => ItemCarRoy.chatListeners(html));
//Hooks.on('getActorDirectoryEntryContext', ActorCarRoy.addDirectoryContextOptions);
