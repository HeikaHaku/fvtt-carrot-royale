/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths: string[] = [
    // Actor Sheet Partials
    //'systems/dnd5e/templates/actors/parts/actor-traits.html',
    // Item Sheet Partials
    //'systems/dnd5e/templates/items/parts/item-action.html',

    // Actor Sheet Partials
    'systems/carroy/templates/actor/parts/actor-inventory.html',
    'systems/carroy/templates/actor/parts/actor-features.html',
    'systems/carroy/templates/actor/parts/actor-spellbook.html',

    //Item Sheet Partials
    'systems/carroy/templates/item/parts/item-action.html',
    'systems/carroy/templates/item/parts/item-activation.html',
    'systems/carroy/templates/item/parts/item-description.html',
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
