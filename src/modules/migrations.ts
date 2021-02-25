/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */

export const migrateWorld = async () => {
  ui.notifications.info(
    `Applying Carrot Royale System Migration for ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`
  );

  // Migrate World Actors
  for (let a of game.actors.entities as any) {
    try {
      const updateData = migrateActorData(a.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      err.message = `Failed carroy system migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrate World Items
  for (let i of game.items.entities) {
    try {
      const updateData = migrateItemData(i.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      err.message = `Failed carroy system migration for Item ${i.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrate Actor Override Tokens
  for (let s of game.scenes.entities) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      err.message = `Failed carroy system migration for Scene ${s.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  for (let p of game.packs as any) {
    if (p.metadata.package !== 'world') continue;
    if (!['Actor', 'Item', 'Scene'].includes(p.metadata.entity)) continue;
    await migrateCompendium(p);
  }

  // Set the migration as complete
  game.settings.set('carroy', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`Carrot Royale System Migration to version ${game.system.data.version} completed!`, { permanent: true });
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack: any) {
  const entity = pack.metadata.entity;
  if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

  // Unlock the pack for editing
  const wasLocked = pack.locked;
  await pack.configure({ locked: false });

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    let updateData: any = {};
    try {
      switch (entity) {
        case 'Actor':
          updateData = migrateActorData(ent.data);
          break;
        case 'Item':
          updateData = migrateItemData(ent.data);
          break;
        case 'Scene':
          updateData = migrateSceneData(ent.data);
          break;
      }
      if (isObjectEmpty(updateData)) continue;

      // Save the entry, if data was changed
      updateData['_id'] = ent._id;
      await pack.updateEntity(updateData);
      console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
    } catch (err) {
      // Handle migration failures
      err.message = `Failed carroy system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
      console.error(err);
    }
  }

  // Apply the original locked status for the pack
  pack.configure({ locked: wasLocked });
  console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {ActorData} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */

export const migrateActorData = (actor: ActorData<any>) => {
  console.log(typeof actor);
  const updateData: any =
    actor.type === 'hero'
      ? {
          data: {
            attributes: {
              death: {
                success: 0,
                failure: 0,
              },
            },
          },
        }
      : {};

  if (!actor.items) return updateData;
  let hasItemUpdates = false;
  const items = actor.items.map((i: unknown) => {
    //Migrate the Owned Item
    let itemUpdate = migrateItemData(i);
    // Update the Owned Item
    if (!isObjectEmpty(itemUpdate)) {
      hasItemUpdates = true;
      return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
    } else return i;
  });
  if (hasItemUpdates) updateData.items = items;
  return updateData;
};

/* -------------------------------------------- */

/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
function cleanActorData(actorData: ActorData<any>) {
  // Scrub system data
  const model = game.system.model.Actor[actorData.type];
  actorData.data = filterObject(actorData.data, model);

  // Scrub system flags
  const allowedFlags = CONFIG.CarotRoyale.allowedActorFlags.reduce((obj: any, f: any) => {
    obj[f] = null;
    return obj;
  }, {});
  if (actorData.flags.carroy) {
    actorData.flags.carroy = filterObject(actorData.flags.carroy, allowedFlags);
  }

  // Return the scrubbed data
  return actorData;
}

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item: any) {
  const updateData =
    /*item.type === 'spell' || item.type === 'feature' || item.type === 'magic'
      ? {
          data: {
            uses: {
              value: 0,
              limit: 0,
            },
          },
        }
      : {};*/
    item.type === 'spell' || item.type === 'feature'
      ? {
          data: {
            summons: [],
          },
        }
      : {};
  /*item.type === 'spell' || item.type === 'feature'
      ? {
          data: {
            uses: {
              value: 0,
              limit: 0,
              charges: 0,
            },
          },
        }
      : {};*/
  console.log(mergeObject(item, new Item(item, {}), { enforceTypes: false, inplace: false }));
  //_migrateItemAttunement(item, updateData);
  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene: any) {
  const tokens = duplicate(scene.tokens);
  return {
    tokens: tokens.map((t: any) => {
      if (!t.actorId || t.actorLink || !t.actorData.data) {
        t.actorData = {};
        return t;
      }
      const token = new Token(t);
      if (!token.actor) {
        t.actorId = null;
        t.actorData = {};
      } else if (!t.actorLink) {
        const updateData = migrateActorData(token.data.actorData);
        t.actorData = mergeObject(token.data.actorData, updateData);
      }
      return t;
    }),
  };
};

/* -------------------------------------------- */
/*  Low level migration utilities
  /* -------------------------------------------- */

/**
 * Migrate the actor speed string to movement object
 * @private
 */
function _migrateActorMovement(actor: any, updateData: any) {
  const ad = actor.data;
  const old = ad?.attributes?.speed?.value;
  if (old === undefined) return;
  const s = (old || '').split(' ');
  if (s.length > 0) updateData['data.attributes.movement.walk'] = ((Number as unknown) as { isNumeric: any }).isNumeric(s[0]) ? parseInt(s[0]) : null;
  updateData['data.attributes.-=speed'] = null;
  return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate the actor traits.senses string to attributes.senses object
 * @private
 */
/*function _migrateActorSenses(actor, updateData) {
  const ad = actor.data;
  if (ad?.traits?.senses === undefined) return;
  const original = ad.traits.senses || '';

  // Try to match old senses with the format like "Darkvision 60 ft, Blindsight 30 ft"
  const pattern = /([A-z]+)\s?([0-9]+)\s?([A-z]+)?/;
  let wasMatched = false;

  // Match each comma-separated term
  for (let s of original.split(',')) {
    s = s.trim();
    const match = s.match(pattern);
    if (!match) continue;
    const type = match[1].toLowerCase();
    if (type in CONFIG.CarrotRoyale.senses) {
      updateData[`data.attributes.senses.${type}`] = Number(match[2]).toNearest(0.5);
      wasMatched = true;
    }
  }

  // If nothing was matched, but there was an old string - put the whole thing in "special"
  if (!wasMatched && !!original) {
    updateData['data.attributes.senses.special'] = original;
  }

  // Remove the old traits.senses string once the migration is complete
  updateData['data.traits.-=senses'] = null;
  return updateData;
}*/

/* -------------------------------------------- */

/**
 * Delete the old data.attuned boolean
 * @private
 */
function _migrateItemAttunement(item: any, updateData: any) {
  if (item.data.attuned === undefined) return;
  updateData['data.attunement'] = 0;
  updateData['data.-=attuned'] = null;
  return updateData;
}

/* -------------------------------------------- */

/**
 * A general tool to purge flags from all entities in a Compendium pack.
 * @param {Compendium} pack   The compendium pack to clean
 * @private
 */
export async function purgeFlags(pack: any) {
  const cleanFlags = (flags: any) => {
    const flagsCarroy = flags.carroy || null;
    return flagsCarroy ? { carroy: flagsCarroy } : {};
  };
  await pack.configure({ locked: false });
  const content = await pack.getContent();
  for (let entity of content) {
    const update: any = { _id: entity.id, flags: cleanFlags(entity.data.flags) };
    if (pack.entity === 'Actor') {
      update.items = entity.data.items.map((i: any) => {
        i.flags = cleanFlags(i.flags);
        return i;
      });
    }
    await pack.updateEntity(update, { recursive: false });
    console.log(`Purged flags from ${entity.name}`);
  }
  await pack.configure({ locked: true });
}

/* -------------------------------------------- */

/**
 * Purge the data model of any inner objects which have been flagged as _deprecated.
 * @param {object} data   The data to clean
 * @private
 */
export function removeDeprecatedObjects(data: any) {
  for (let [k, v] of Object.entries(data) as [any, any]) {
    if (getType(v) === 'Object') {
      if (v._deprecated === true) {
        console.log(`Deleting deprecated object key ${k}`);
        delete data[k];
      } else removeDeprecatedObjects(v);
    }
  }
  return data;
}
