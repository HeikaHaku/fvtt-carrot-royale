/**
 * A simple form to set actor movement speeds
 * @implements {BaseEntitySheet}
 */
export default class ActorClassConfig extends BaseEntitySheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'class-config',
      classes: ['carroy'],
      template: 'systems/carroy/templates/apps/class-config.html',
      width: 500,
      height: 'auto',
      closeOnSubmit: true,
    });
  }
  /* -------------------------------------------- */

  /** @override */
  get title() {
    return `${game.i18n.localize('CarRoy.ClassConfig')}: ${this.object.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data: Record<string, any> = {};
    data.actor = this.object;
    data.flags = this._getFlags();
    console.log(data);

    return data;
  }

  private _getFlags() {
    const flags: Record<string, any> = {};
    const baseData = this.entity._data;

    let tied: string | any[] = [];
    let choices = [];

    for (const c of this.entity.itemTypes.class) {
      if (tied.length) {
        if (c.data.data.levels > tied[0].data.data.levels) tied = [c];
        else if (c.data.data.levels == tied[0].data.data.levels) tied.push(c);
      } else tied = [c];
      if (c.data.data.levels == 5) choices = CONFIG.CarrotRoyale.classFeatures[c.data.name.toLowerCase()].choices;
    }
    const classes = tied.reduce((cls, cur) => {
      cls[cur.data.name.toLowerCase()] = cur.data.name;
      return cls;
    }, {});

    let flag = {
      name: 'CarRoy.MainClass',
      hint: 'CarRoy.MainClassHint',
      section: 'CarRoy.ClassChoices',
      choices: classes,
      type: String.name,
      isSpecial: false,
      value: getProperty(baseData.flags, `carroy.mainClass`),
    };
    flags[flag.section] = {};
    flags[flag.section]['flags.carroy.mainClass'] = flag;

    if (choices) {
      for (const choice of choices) {
        const chc = Object.entries(choice).reduce((pre: any[], cur: [string, any]) => {
          if (Array.isArray(cur[1])) {
            for (let i of cur[1]) pre.push([cur[0], i]);
          } else pre.push(cur);
          return pre;
        }, []);

        flag = {
          name: 'CarRoy.ClassSpecial',
          hint: 'CarRoy.ClassSpecialHint',
          section: 'CarRoy.ClassChoices',
          choices: chc,
          type: String.name,
          isSpecial: true,
          value: getProperty(baseData.flags, `carroy.classSpecial.${choices.indexOf(choice)}`),
        };
        flags[flag.section][`flags.carroy.classSpecial.${choices.indexOf(choice)}`] = flag;
      }
    }

    return flags;
  }

  /** @override */
  async _updateObject(event: any, formData: any) {
    const actor = this.object;
    let updateData = expandObject(formData);

    console.log(formData, updateData);

    await actor.update(updateData, { diff: false });
  }
}
