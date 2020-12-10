Hooks.once('ready', async () => {
  Handlebars.registerHelper('prepAbilityLocale', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1));

  Handlebars.registerHelper('prepAbilityLocaleAbbr', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1) + 'Abbr');

  Handlebars.registerHelper('concat', (arg1: string, arg2: string) => ''.concat(arg1, arg2));

  Handlebars.registerHelper('firstUpper', (arg: string) => arg.charAt(0).toUpperCase() + arg.slice(1));

  Handlebars.registerHelper('modCalc', (arg1: number) => (arg1 < 10 ? '-' : '+') + Math.floor((arg1 - 10) / 2));
});
