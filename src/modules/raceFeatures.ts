export const RaceFeatures = {
  orc: {
    bonus: {
      stats: {
        movement: 1,
        ac: -2,
      },
    },
  },
  human: {},
  dwarf: {
    bonus: {
      stats: {
        movement: -1,
        ac: 2,
      },
    },
  },
  elf: {
    bonus: {
      stats: {
        init: 4,
        hp: -10,
      },
    },
  },
  gnome: {
    bonus: {
      stats: {
        movement: -1,
        ac: -2,
        saves: 2,
      },
    },
  },

  troll: {
    bonus: {
      stats: {
        saves: -5,
        regen: 2,
      },
    },
  },
  giant: {
    bonus: {
      stats: {
        damage: 3,
        ac: -2,
        init: -12,
      },
    },
  },
};
