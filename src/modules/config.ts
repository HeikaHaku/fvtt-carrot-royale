export const CarrotRoyale: any = {};

/**
 * The set of Equipment Types for Armor.
 * @type (Object)
 */

CarrotRoyale.armorTypes = {
  light: 'CarRoy.LightArmor',
  medium: 'CarRoy.MediumArmor',
  heavy: 'CarRoy.HeavyArmor',
  shield: 'CarRoy.Shield',
};

/* -------------------------------------------- */

/**
 * Define the set of types which a weapon item can take
 * @type (Object)
 */

CarrotRoyale.weaponTypes = {
  melee: 'CarRoy.Melee',
  ranged: 'CarRoy.Ranged',
};

CarrotRoyale.weaponWeights = {
  light: 'CarRoy.Light',
  heavy: 'CarRoy.Heavy',
};

/**
 * Define the set of property flags which can exist on a weapon
 * @type (Object)
 */

CarrotRoyale.weaponProperties = {
  twoHand: 'CarRoy.TwoHanded',
  oneHand: 'CarRoy.OneHanded',
};

/* -------------------------------------------- */

/**
 * Define the types of Actions.
 * @type (Object)
 */

CarrotRoyale.actionTypes = {
  mAttack: 'CarRoy.MeleeAttack',
  rAttack: 'CarRoy.RangedAttack',
  sAttack: 'CarRoy.SpellAttack',
  sThrow: 'CarRoy.SavingThrow',
  healing: 'CarRoy.Healing',
  other: 'CarRoy.Other',
};

/**
 * Define the Activation Types of Actions
 * @type (Object)
 */

CarrotRoyale.activationTypes = {
  none: 'CarRoy.None',
  action: 'CarRoy.Action',
  bonus: 'CarRoy.BonusAction',
  reaction: 'CarRoy.Reaction',
  free: 'CarRoy.FreeAction',
};

/* -------------------------------------------- */

/**
 * Define the Abilities
 * @type (Object)
 */

CarrotRoyale.abilities = {
  str: 'CarRoy.AbilityStr',
  dex: 'CarRoy.AbilityDex',
  con: 'CarRoy.AbilityCon',
  int: 'CarRoy.AbilityInt',
  wis: 'CarRoy.AbilityWis',
  cha: 'CarRoy.AbilityCha',
};

CarrotRoyale.abilitiesAbbr = {
  str: 'CarRoy.AbilityStrAbbr',
  dex: 'CarRoy.AbilityDexAbbr',
  con: 'CarRoy.AbilityConAbbr',
  int: 'CarRoy.AbilityIntAbbr',
  wis: 'CarRoy.AbilityWisAbbr',
  cha: 'CarRoy.AbilityChaAbbr',
};

CarrotRoyale.bonusStats = {
  hp: 'CarRoy.HitPoints',
  str: 'CarRoy.AbilityStr',
  dex: 'CarRoy.AbilityDex',
  con: 'CarRoy.AbilityCon',
  int: 'CarRoy.AbilityInt',
  wis: 'CarRoy.AbilityWis',
  cha: 'CarRoy.AbilityCha',
  damage: 'CarRoy.Damage',
  ac: 'CarRoy.ArmorClass',
  regen: 'CarRoy.HPRegen',
  init: 'CarRoy.Initiative',
  saves: 'CarRoy.SavingThrows',
  move: 'CarRoy.Movement',
  attack: 'CarRoy.AttackBonus',
};

/* -------------------------------------------- */

/**
 * Define Movement Units
 * @type (Object)
 */
CarrotRoyale.movementUnits = {
  sq: 'CarRoy.DistSquare',
};

/**
 * Define Distance Units
 * @type (Object)
 */

CarrotRoyale.distanceUnits = {
  sq: 'CarRoy.DistSquare',
};

/**
 * Define the Target Types
 * @type (Object)
 */
CarrotRoyale.targetTypes = {
  none: 'CarRoy.None',
  self: 'CarRoy.TargetSelf',
  creature: 'CarRoy.TargetCreature',
  ally: 'CarRoy.TargetAlly',
  enemy: 'CarRoy.TargetEnemy',
  object: 'CarRoy.TargetObject',
  space: 'CarRoy.TargetSpace',
  radius: 'CarRoy.TargetRadius',
  sphere: 'CarRoy.TargetSphere',
  cylinder: 'CarRoy.TargetCylinder',
  cone: 'CarRoy.TargetCone',
  square: 'CarRoy.TargetSquare',
  cube: 'CarRoy.TargetCube',
  line: 'CarRoy.TargetLine',
  wall: 'CarRoy.TargetWall',
};

CarrotRoyale.areaTargetTypes = {
  cone: 'cone',
  cube: 'rect',
  cylinder: 'circle',
  line: 'ray',
  radius: 'circle',
  sphere: 'circle',
  square: 'rect',
  wall: 'ray',
};

/* -------------------------------------------- */

/**
 * Define Time Units for Durations
 * @type (Object)
 */

CarrotRoyale.timePeriods = {
  turns: 'CarRoy.Turns',
  concentration: 'CarRoy.Concentration',
  none: 'CarRoy.None',
  special: 'CarRoy.Special',
  per: 'CarRoy.PerLevel',
};

/* -------------------------------------------- */

/**
 * Define the types of Currencies
 * @type (Object)
 */

CarrotRoyale.currencies = {
  coins: 'CarRoy.CurrencyCoins',
};
