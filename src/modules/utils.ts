import ActorCarRoy from './actor/entity';

export async function prepareMainClass(actor: any, itemData: any = null, cls: any = null) {
  if (itemData === null) itemData = { name: null, data: { levels: 0 } };
  let main = actor.itemTypes.class.reduce((a: null | any[] | any, b: { data: { data: { levels: number }; levels: any } }) => {
    if (a === null) return (a = b);
    if (Array.isArray(a)) {
      let tmp = 0;
      a.forEach((i) => (tmp < i.data.data.levels ? (tmp = i.data.data.levels) : (tmp = tmp)));
      if (b.data.data.levels == tmp) a.push(b);
    } else a.data.data.levels == b.data.data.levels ? (a = [a, b]) : a.data.data.levels < b.data.data.levels ? (a = b) : (a = a);
    return a;
  }, null);
  //console.log(main);
  if (main == null) return await actor.update({ 'flags.carroy.mainClass': itemData?.name?.toLowerCase() || null });
  if (Array.isArray(main))
    main[0].data.data.levels < (itemData as any).levels
      ? (main = cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
      : main[0].data.data.levels == (itemData as any).levels
      ? main.push(cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
      : (main = main);
  else
    main.data.data.levels < (itemData as any).levels
      ? (main = cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } })
      : main.data.data.levels == (itemData as any).levels
      ? (main = [main, cls ?? { data: { name: itemData.name, data: { levels: itemData.levels } } }])
      : (main = main);

  if (Array.isArray(main)) {
    if (
      !main.reduce((a, b) => {
        if (actor.data.flags.carroy.mainClass) a = a || actor.data.flags.carroy.mainClass === b.data.name.toLowerCase();
        else a = true;
        return a;
      }, false)
    )
      return await actor.update({ 'flags.carroy.mainClass': main[~~(Math.random() * main.length)].data.name.toLowerCase() });
    else return;
  } else
    actor.data?.flags?.carroy?.mainClass === main.data.name.toLowerCase()
      ? (main = main)
      : await actor.update({ 'flags.carroy.mainClass': main.data.name.toLowerCase() });
}

export async function getBonuses(actor: ActorCarRoy, bonusName: string, buffOnly: boolean = false) {
  const race = CONFIG.CarrotRoyale.raceFeatures[actor.itemTypes.race.find((item) => item)?.name.toLowerCase() || ''];
  const flags = actor.data.flags;

  let sum = { number: 0, string: '' };

  const actors: ActorCarRoy[] =
    (await game.actors?.filter((actr: { data: { type: string }; hasPlayerOwner: boolean }) => actr.data.type === 'hero' && actr.hasPlayerOwner)) || [];
  const [team, enemyTeam] = actors.reduce(
    (a, b) => {
      a[actor.data.data.team == b.data.data.team ? 0 : 1].push(b);
      return a;
    },
    [[] as ActorCarRoy[], [] as ActorCarRoy[]]
  );

  let restricted = 0;

  for (let player of team) {
    for (let cls of player.itemTypes.class) {
      const classConfig = CONFIG.CarrotRoyale.classFeatures[cls.name.toLowerCase()];
      for (let buff of (Object.entries(classConfig?.buffs || {}) as [string, any]) || []) {
        if (cls.data.data.levels >= parseInt(buff[0])) {
          let b = buff[1]?.team?.[bonusName] || 0;
          if (typeof b === 'number') sum.number += b;
          else if (typeof b === 'string') sum.string += ` + ${b}`;
          else continue;
          //sum += buff[1]?.team?.[bonusName] || 0;
          restricted = restricted < (buff[1]?.restricted?.[bonusName] || 100000) ? buff[1]?.restricted?.[bonusName] || 0 : restricted;
        }
      }
    }
  }

  if (typeof restricted === 'number') sum.number += restricted;
  else if (typeof restricted === 'string') sum.string += ` + ${restricted}`;
  //sum += restricted;

  if (buffOnly) return sum;
  restricted = 0;

  for (let player of enemyTeam) {
    for (let cls of player.itemTypes.class) {
      const classConfig = CONFIG.CarrotRoyale.classFeatures[cls.name.toLowerCase()];
      for (let debuff of (Object.entries(classConfig?.debuffs || {}) as [string, any]) || []) {
        if (cls.data.data.levels >= parseInt(debuff[0])) {
          let d = debuff[1]?.team?.[bonusName] || 0;
          if (typeof d === 'number') sum.number += d;
          else if (typeof d === 'string') sum.string += ` + ${d}`;
          else continue;
          //sum -= debuff[1].team?.[bonusName] || 0;
          restricted = restricted < (debuff[1]?.restricted?.[bonusName] || 100000) ? debuff[1]?.restricted?.[bonusName] || 0 : restricted;
        }
      }
    }
  }

  if (!isNaN(parseInt(restricted + ''))) sum.number += restricted;
  else sum.string += ` + ${restricted}`;
  //sum += restricted;
  //sum -= restricted;

  if (race?.bonus?.stats?.[bonusName]) {
    if (!isNaN(parseInt(race?.bonus?.stats?.[bonusName]))) sum.number += race?.bonus?.stats?.[bonusName] || 0;
  }
  for (let item of actor.items.filter((item: { type: string }) => !['class', 'race'].includes(item.type))) {
    for (let stats of (item.data?.data?.bonus?.stats as [string, string]) || []) {
      if (stats[1] === bonusName) {
        if (!isNaN(parseInt(stats[0]))) sum.number += parseInt(stats[0]) || 0;
        else sum.string += ` + ${stats[0]}`;
      }
    }
  }

  if (flags?.carroy?.classSpecial) {
    for (let special of Object.values(flags.carroy.classSpecial) as string[]) {
      let [type, value] = special.split(',');
      if (type === bonusName) {
        if (isNaN(parseInt(value))) sum.string += ` + ${value}`;
        else sum.number += parseInt(value) || 0;
      }
    }
  }
  return sum;
}
