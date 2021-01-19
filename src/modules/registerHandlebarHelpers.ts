Hooks.once('ready', async () => {
  Handlebars.registerHelper('prepAbilityLocale', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1));

  Handlebars.registerHelper('prepAbilityLocaleAbbr', (ability: string) => 'CarRoy.Ability' + ability.charAt(0).toUpperCase() + ability.slice(1) + 'Abbr');

  Handlebars.registerHelper('concat', (arg1: string, arg2: string) => ''.concat(arg1, arg2));

  Handlebars.registerHelper('firstUpper', (arg: string) => arg.titleCase());

  Handlebars.registerHelper('equipped', (arg: boolean) => (arg ? 'Equipped' : 'Not Equipped'));

  Handlebars.registerHelper('onehand', (arg: boolean) => (arg ? '2h ' : '1h '));

  Handlebars.registerHelper('meleeRanged', (melee: boolean, ranged: boolean) => (melee ? 'Melee' : ranged ? 'Ranged' : 'Unknown'));

  Handlebars.registerHelper('conlog', (arg: any) => console.log(arg));

  Handlebars.registerHelper('formatChoice', (arg: any[], options) => {
    if (arg[0] === 'feature') {
      if (options['hash']['value']) return [arg[0], arg[1].name, arg[1].id].join(',');
      else return arg[1].name;
    } else {
      if (options['hash']['value']) return arg.join(',');
      else {
        let sign = Math.sign(arg[1]);

        return (sign > -1 ? '+' : '') + arg.reverse().join(' ').titleCase();
      }
    }
  });

  Handlebars.registerHelper('choicesLength', (arg) => {
    return Object.values(arg).length;
  });
});
