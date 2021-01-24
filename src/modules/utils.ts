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
  console.log(main);
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
