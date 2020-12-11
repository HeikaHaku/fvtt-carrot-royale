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

/* -------------------------------------------- */

/**
 * Define the Ability Modifiers
 * @type (Object)
 */

CarrotRoyale.abilityMods = {
  str: 'CarRoy.AbilityStr',
  dex: 'CarRoy.AbilityDex',
  con: 'CarRoy.AbilityCon',
  int: 'CarRoy.AbilityInt',
  wis: 'CarRoy.AbilityWis',
  cha: 'CarRoy.AbilityCha',
};

CarrotRoyale.abilityModsAbbr = {
  str: 'CarRoy.AbilityStrAbbr',
  dex: 'CarRoy.AbilityDexAbbr',
  con: 'CarRoy.AbilityConAbbr',
  int: 'CarRoy.AbilityIntAbbr',
  wis: 'CarRoy.AbilityWisAbbr',
  cha: 'CarRoy.AbilityChaAbbr',
};
