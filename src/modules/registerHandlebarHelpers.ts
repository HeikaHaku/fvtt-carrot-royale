Hooks.once('ready', async () => {
  Handlebars.registerHelper('prepAbilityLocale', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1));

  Handlebars.registerHelper('prepAbilityLocaleAbbr', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1) + 'Abbr');

  Handlebars.registerHelper('concat', (arg1: string, arg2: string) => ''.concat(arg1, arg2));

  Handlebars.registerHelper('firstUpper', (arg: string) => arg.titleCase());

  Handlebars.registerHelper('modCalc', (arg: number) => (arg >= 10 ? '+' : '') + Math.floor((arg - 10) / 2));

  Handlebars.registerHelper('equipped', (arg: boolean) => (arg ? 'Equipped' : 'Not Equipped'));

  Handlebars.registerHelper('onehand', (arg: boolean) => (arg ? '2h ' : '1h '));

  Handlebars.registerHelper('meleeRanged', (melee: boolean, ranged: boolean) => (melee ? 'Melee' : ranged ? 'Ranged' : 'Unknown'));
});
