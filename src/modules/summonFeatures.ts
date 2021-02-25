export const SummonFeatures = {
  imp: {
    stats: {
      ac: 15,
      hp: 25,
      movement: 3,
      saves: 2,
    },
    attacks: [
      {
        name: 'Hellish Bolt',
        attack: 2,
        damage: '1d4-1',
        range: 6,
        type: 'Ranged',
      },
    ],
    img: 'imp',
  },
  mastiff: {
    stats: {
      ac: 16,
      hp: 38,
      movement: 8,
      saves: -1,
    },
    attacks: [
      {
        name: 'Bite',
        attack: 3,
        damage: '1d6+1',
        range: 1,
        type: 'Melee',
      },
    ],
    img: 'dog',
  },
  owl: {
    stats: {
      ac: 18,
      hp: 35,
      movement: 6,
      saves: 4,
    },
    buffs: {
      team: {
        hp: 10,
      },
    },
    img: 'owl',
  },

  'mud golem': {
    stats: {
      ac: 14,
      hp: 45,
      saves: -2,
      movement: 4,
    },
    attacks: [
      {
        name: 'Slam',
        always: true,
        damage: 1,
        type: 'Melee',
        range: 1,
      },
    ],
    img: 'golem terra',
  },
  'ice golem': {
    stats: {
      ac: 19,
      hp: 45,
      movement: 4,
    },
    attacks: [
      {
        name: 'Frost Shard',
        attack: 5,
        damage: 3,
        type: 'Melee',
        range: 1,
      },
    ],
    img: 'golem ice',
  },
  'lightning golem': {
    stats: {
      ac: 12,
      hp: 25,
      init: 3,
      movement: 4,
    },
    attacks: [
      {
        name: 'Lightning Bolt',
        always: true,
        damage: 5,
        type: 'Ranged',
        range: 6,
      },
    ],
    img: 'golem fulmine',
  },
  'fire golem': {
    //Fire Golem, 15 AC, 50 HP, +8 attack bonus, Flame Burst 7 damage melee attack, +0 initiative, +0 saving throws, Mov.4. Special, Flaming aura: everyone standing in a 3x3 square centered on the golem takes 1 fire damage on the golem’s turn. Any incapacitated hero in the aura automatically adds a failure to their death saving throw.
    stats: {
      ac: 15,
      hp: 50,
      movement: 4,
    },
    attacks: [
      {
        name: 'Flame Burst',
        attack: 8,
        damage: 7,
        range: 1,
        type: 'Melee',
      },
    ],
    aura: {
      name: 'Flaming Aura',
      range: 1,
      shape: 'Square',
      damage: 1,
    },
    img: 'golem fuoco',
  },

  'spiritual weapon': {
    stats: {
      movement: 4,
    },
    ethereal: true,
    attacks: [
      {
        attack: 5,
        damage: '1d10+2',
        type: 'Melee',
        range: 1,
      },
    ],
    img: 'arma spirituale',
  },

  'undead dragon': {
    //AC 12, 35 HP, +2 attack bonus, 2 melee attacks 1d12, reach 2, +0 Initiative, +0 TS, Mov. 4.  Terrifying Aura: -2 AC and -1 saving throws to all enemies on the map.
    stats: {
      ac: 12,
      hp: 35,
      movement: 4,
    },
    attacks: [
      {
        attack: 2,
        damage: '1d12',
        range: 2,
        type: 'Melee',
      },
    ],
    debuffs: {
      team: {
        ac: -2,
        saves: -1,
      },
    },
    img: 'dragone',
  },
};
