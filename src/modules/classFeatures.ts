export const ClassFeatures = {
  warrior: {
    abilities: {
      hp: 10,
      str: 14,
      dex: 14,
      con: 14,
      int: 10,
      wis: 10,
      cha: 10,
    },
    features: {
      1: [{ name: 'Second Wind', id: 'Compendium.carroy.features-cr.ELRJXUafsFPISWwF' }],
      2: [{ name: 'Fighting Style', id: 'Compendium.carroy.features-cr.q1ngF16dh5xguVfJ' }],
      4: [{ name: 'Manuever', id: 'Compendium.carroy.features-cr.DhQORhGwzUEzjjzT' }],
    },
    buffs: {
      3: {
        team: {
          attack: 3,
        },
      },
      5: {
        restricted: {
          str: 4,
        },
      },
    },
    choices: [
      [
        {
          attack: 2,
          feature: [{ name: 'Extra Shot', id: 'Compendium.carroy.features-cr.CKRujtw4bn772mr7' }],
        },
      ],
    ],
    martial: true,
  },
  paladin: {
    abilities: {
      hp: 10,
      str: 12,
      dex: 14,
      con: 10,
      int: 10,
      wis: 12,
      cha: 14,
    },
    features: {
      1: [{ name: 'Lay On Hands', id: 'Compendium.carroy.features-cr.rOK6o4GdzpGNS3Y5' }],
      2: [{ name: 'Righteous Punishment', id: 'Compendium.carroy.features-cr.fxsnsqzMC49ho3Sk' }],
      4: [{ name: 'Protect Ally', id: 'Compendium.carroy.features-cr.BFH7BrUfShLq8Xp7' }],
    },
    buffs: {
      3: {
        team: {
          ac: 3,
        },
      },
      5: {
        restricted: {
          str: 4,
        },
      },
    },
    choices: [
      [
        {
          ac: 2,
          damage: 2,
        },
      ],
    ],
    martial: true,
  },
  barbarian: {
    abilities: {
      hp: 12,
      str: 16,
      dex: 14,
      con: 16,
      int: 8,
      wis: 8,
      cha: 10,
    },
    features: {
      1: [{ name: 'Battle Trance', id: 'Compendium.carroy.features-cr.3fQ3wuR6OsaOYJgs' }],
      2: [{ name: 'Frenzy', id: 'Compendium.carroy.features-cr.h6oFIIjZNHJwEAmK' }],
      4: [{ name: 'Leap', id: 'Compendium.carroy.features-cr.vUngVaO34OAkUo6r' }],
    },
    buffs: {
      3: {
        team: {
          damage: 3,
        },
      },
      5: {
        restricted: {
          str: 4,
        },
      },
    },
    choices: [
      [
        {
          damage: 2,
          movement: 1,
        },
      ],
    ],
    martial: true,
  },
  bard: {
    abilities: {
      hp: 6,
      str: 10,
      dex: 12,
      con: 10,
      int: 12,
      wis: 12,
      cha: 16,
    },
    features: {
      1: [
        { name: 'Inspire', id: 'Compendium.carroy.features-cr.qzzU12Eh2NitsFkx' },
        { name: 'Bliss', id: 'Compendium.carroy.features-cr.QWwz8PGFLfwQBOSA' },
        { name: 'Scorn', id: 'Compendium.carroy.spells-cr.o4P6biJ6fqSROluD' },
      ],
      2: [
        { name: 'Dishearten', id: 'Compendium.carroy.features-cr.bHTbjlsYHPBtIr1R' },
        { name: 'Whisper', id: 'Compendium.carroy.spells-cr.3U6ZcKxcyIVa3F87' },
      ],
      3: [{ name: 'Bolstering Melody', id: 'Compendium.carroy.spells-cr.B1pqyBEGB5d9aN2L' }],
      4: [{ name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 3 }],
      5: [{ name: 'Purge', id: 'Compendium.carroy.spells-cr.IYzNNcJjHO3pGFJ9' }],
    },
    spells: {
      1: [{ name: 'Scorn' }],
      2: [{ name: 'Whisper' }],
      3: [{ name: 'Bolstering Melody' }],
      4: [{ name: 'Cure Wounds', level: 3 }],
      5: [{ name: 'Purge' }],
    },
    buffs: {
      3: {
        team: {
          ac: 2,
        },
      },
      4: {
        team: {
          saves: 2,
        },
      },
      5: {
        restricted: {
          con: 2,
        },
      },
    },
  },
  druid: {
    abilities: {
      hp: 8,
      str: 12,
      dex: 12,
      con: 14,
      int: 10,
      wis: 14,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Familiar Spirit', id: 'Compendium.carroy.features-cr.zSuFcaQzZMtKj8UN' },
        { name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 1 },
      ],
      2: [
        { name: 'Shape Shifting', id: 'Compendium.carroy.features-cr.GEe3IX1wiOGtVid7' },
        { name: 'Moonbeam', id: 'Compendium.carroy.spells-cr.dCrB9aGsC7vCk6X3' },
      ],
      3: [{ name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 2 }],
      4: [{ name: 'Blizzard', id: 'Compendium.carroy.spells-cr.h3gqqbwYQZk9KXom' }],
      5: [{ name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 5 }],
    },
    spells: {
      1: [{ name: 'Cure Wounds', level: 1 }],
      2: [{ name: 'Moonbeam' }],
      3: [{ name: 'Cure Wounds', level: 2 }],
      4: [{ name: 'Blizzard' }],
      5: [{ name: 'Cure Wounds', level: 5 }],
    },
    buffs: {
      3: {
        team: {
          damage: 2,
          mDamage: 2,
        },
      },
      4: {
        team: {
          healing: '1d6',
        },
      },
      5: {
        restricted: {
          con: 2,
        },
      },
    },
  },
  cleric: {
    abilities: {
      hp: 8,
      str: 12,
      dex: 12,
      con: 14,
      int: 10,
      wis: 14,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Divine Fervor', id: 'Compendium.carroy.features-cr.oKKqnDmD20RfCQNZ' },
        { name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 1 },
      ],
      2: [
        { name: 'Dispel', id: 'Compendium.carroy.features-cr.Sotv4VqSE9ty5J9d' },
        { name: 'Spiritual Weapon', id: 'Compendium.carroy.spells-cr.g01LyiajaIAUCdPa' },
      ],
      3: [{ name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 2 }],
      4: [{ name: 'Cure Wounds', id: 'Compendium.carroy.spells-cr.VhM5jOlgXL1x9AKy', level: 4 }],
      5: [{ name: 'Searing Strike', id: 'Compendium.carroy.spells-cr.PwgJm8OLlOGog4nE' }],
    },
    spells: {
      1: [{ name: 'Cure Wounds', level: 1 }],
      2: [{ name: 'Spiritual Weapon' }],
      3: [{ name: 'Cure Wounds', level: 2 }],
      4: [{ name: 'Cure Wounds', level: 4 }],
      5: [{ name: 'Searing Strike' }],
    },
    buffs: {
      3: {
        team: {
          hp: 10,
        },
      },
      5: {
        restricted: {
          con: 2,
        },
      },
    },
    debuffs: {
      4: {
        team: {
          movement: -1,
        },
      },
    },
  },
  wizard: {
    abilities: {
      hp: 6,
      str: 8,
      dex: 10,
      con: 10,
      int: 18,
      wis: 16,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Familiar Spirit', id: 'Compendium.carroy.features-cr.zSuFcaQzZMtKj8UN' },
        { name: 'Magic Missile', id: 'Compendium.carroy.spells-cr.1KnMpMXkJMjaNMuH' },
      ],
      2: [
        { name: 'Dispel', id: 'Compendium.carroy.features-cr.Sotv4VqSE9ty5J9d' },
        { name: 'Burning Hands', id: 'Compendium.carroy.spells-cr.p4di4WZVp68mS8nr' },
      ],
      3: [{ name: 'Fireball', id: 'Compendium.carroy.spells-cr.ALkCAiEUNltTj2G9' }],
      4: [{ name: 'Chain Lightning', id: 'Compendium.carroy.spells-cr.rf6wmUbHQTLQMW8Q' }],
      5: [
        { name: 'Counterspell', id: 'Compendium.carroy.spells-cr.5FqNOH42NOtsjOKj' },
        { name: 'Ray of Frost', id: 'Compendium.carroy.spells-cr.wZFUWoRRvbD7uux6' },
      ],
    },
    spells: {
      1: [{ name: 'Magic Missile' }],
      2: [{ name: 'Burning Hands' }],
      3: [{ name: 'Fireball' }],
      4: [{ name: 'Chain Lightning' }],
      5: [{ name: 'Counterspell' }, { name: 'Ray of Frost' }],
    },
    buffs: {
      3: {
        team: {
          mDamage: '1d4',
        },
      },
      4: {
        team: {
          mDamage: 2,
        },
      },
      5: {
        restricted: {
          mDamage: '1d4',
        },
      },
    },
  },
  monk: {
    abilities: {
      hp: 10,
      str: 14,
      dex: 14,
      con: 12,
      int: 10,
      wis: 12,
      cha: 10,
    },
    features: {
      1: [{ name: 'Flurry of Blows', id: 'Compendium.carroy.features-cr.eVtiiTi6eXlD9b1I' }],
      2: [
        { name: 'Zen Blow', id: 'Compendium.carroy.features-cr.woVSKodkE35mkFTt' },
        { name: 'Empty Mind', id: 'Compendium.carroy.features-cr.sgDrGd16HVJpp2NU' },
      ],
    },
    buffs: {
      3: {
        team: {
          damage: 3,
        },
      },
      4: {
        team: {
          movement: 1,
        },
      },
      5: {
        restricted: {
          dex: 4,
        },
      },
    },
    choices: [
      [
        {
          movement: 1,
          feature: [{ name: 'Zen Blow', id: 'Compendium.carroy.features-cr.woVSKodkE35mkFTt', uses: 2 }],
        },
      ],
    ],
    martial: true,
  },
  sorcerer: {
    abilities: {
      hp: 6,
      str: 8,
      dex: 10,
      con: 10,
      int: 18,
      wis: 16,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Familiar Spirit', id: 'Compendium.carroy.features-cr.zSuFcaQzZMtKj8UN' },
        { name: 'Thunderwave', id: 'Compendium.carroy.spells-cr.vUN2cUk2kB92A0OO' },
      ],
      2: [
        { name: 'Dispel', id: 'Compendium.carroy.features-cr.Sotv4VqSE9ty5J9d' },
        { name: 'Magic Mark', id: 'Compendium.carroy.spells-cr.xdnfmjTyrzlGgjzk' },
      ],
      3: [{ name: 'Magic Missile', id: 'Compendium.carroy.spells-cr.1KnMpMXkJMjaNMuH' }],
      4: [
        { name: 'Crimson Mark', id: 'Compendium.carroy.features-cr.EYJZY9eWQyS7X71u' },
        { name: 'Dimensional Door', id: 'Compendium.carroy.spells-cr.JUPkhUiZKTLGqDNh' },
      ],
      5: [
        { name: 'Hold Person', id: 'Compendium.carroy.spells-cr.r8qUW9wxCSvfJBdU' },
        { name: 'Greasy Coat', id: 'Compendium.carroy.spells-cr.XadTbOoJL0K4kLj9' },
      ],
    },
    spells: {
      1: [{ name: 'Thunderwave' }],
      2: [{ name: 'Magic Mark' }],
      3: [{ name: 'Magic Missile' }],
      4: [{ name: 'Dimension Door' }],
      5: [{ name: 'Hold Person' }, { name: 'Greasy Coat' }],
    },
    buffs: {
      3: {
        team: {
          saves: 2,
        },
      },
      5: {
        restricted: {
          saves: 2,
        },
      },
    },
    choices: [
      [
        {
          mDamage: 2,
          init: 2,
        },
      ],
    ],
  },
  rogue: {
    abilities: {
      hp: 6,
      str: 10,
      dex: 18,
      con: 10,
      int: 12,
      wis: 12,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Sneak Attack', id: 'Compendium.carroy.features-cr.MS5ZJozJsldnneSN' },
        { name: 'Lucky Dice', id: 'Compendium.carroy.features-cr.UM0OesghlP1398rg' },
      ],
      2: [{ name: 'Acute Senses', id: 'Compendium.carroy.features-cr.1apiKdoZj7ZWS1Fl' }],
    },
    buffs: {
      3: {
        team: {
          attack: 3,
        },
      },
      5: {
        restricted: {
          dex: 4,
        },
      },
    },
    debuffs: {
      4: {
        team: {
          ac: -2,
        },
      },
    },
    martial: true,
  },
  necromancer: {
    abilities: {
      hp: 6,
      str: 14,
      dex: 6,
      con: 12,
      int: 14,
      wis: 16,
      cha: 10,
    },
    features: {
      1: [
        { name: 'Summon Golem', id: 'Compendium.carroy.features-cr.4890ajA9YZTxDbhe', level: 1 },
        { name: 'Withering Ray', id: 'Compendium.carroy.spells-cr.8wigPUWu91witY84' },
      ],
      2: [
        { name: 'Summon Golem', id: 'Compendium.carroy.features-cr.4890ajA9YZTxDbhe', level: 2 },
        { name: 'Feeble Mind', id: 'Compendium.carroy.spells-cr.Tk6GzL1L9a9BNDlu' },
      ],
      3: [
        { name: 'Summon Golem', id: 'Compendium.carroy.features-cr.4890ajA9YZTxDbhe', level: 3 },
        { name: 'Summon Undead Dragon', id: 'Compendium.carroy.spells-cr.qbA1pCTu57HgUhOj' },
      ],
      4: [{ name: 'Slow', id: 'Compendium.carroy.spells-cr.ntgDltisgu0vaHTz' }],
      5: [
        { name: 'Summon Golem', id: 'Compendium.carroy.features-cr.4890ajA9YZTxDbhe', level: 4 },
        { name: 'Lifesteal', id: 'Compendium.carroy.spells-cr.CCH7Ao3yPS1ZQIEZ' },
      ],
    },
    spells: {
      1: [{ name: 'Withering Ray', id: 'Compendium.carroy.features-cr.' }],
      2: [{ name: 'Feeble Mind', id: 'Compendium.carroy.features-cr.' }],
      3: [{ name: 'Summon Undead Dragon', id: 'Compendium.carroy.features-cr.' }],
      4: [{ name: 'Slow', id: 'Compendium.carroy.features-cr.' }],
      5: [{ name: 'Lifesteal', id: 'Compendium.carroy.features-cr.' }],
    },
    debuffs: {
      4: {
        team: {
          hp: -5,
        },
      },
    },
    choices: [
      [
        {
          feature: [
            { name: 'Phantom Skulls', id: 'Compendium.carroy.features-cr.gKu3GcPuu98T849X' },
            { name: 'Bone Scythe', id: 'Compendium.carroy.features-cr.zpjeClrIppnCB02Z' },
          ],
        },
      ],
    ],
  },
};
