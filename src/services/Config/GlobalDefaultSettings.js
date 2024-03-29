/** default settings */
let skipEnabled = true;

/**
 * This object contains a mapping of a setting and its metadata.
 * The metadata includes all details necessary for rendering a particular setting
 * on the settings menu.
 *
 * "title" - The locale path of the title of a setting that will be shown on the main panel of the menu.
 * "description" - The locale path of the description to the above title
 * "type" - The type of the setting. Options can be - checkbox, range, text, number etc
 */
export let settingsMetadata = {
  skipEnabled: {
    title: "settings.menu.title.skipEnabled",
    description: "settings.menu.description.skipEnabled",
    type: "checkbox",
  },
};

/**
 * The below exported map is the global default settings object.
 * These are the default values of settings to be used when no setting has been explicitly set.
 * Different components might choose to use the full structure or a part of it as necessary.
 * There are three levels of settings. These are called:
 * - Headers: (eg - player, app etc.)
 * - Tabs: (eg - configuration, appearance etc.)
 * - Leafs: (eg - skipEnabled, darkMode etc.)
 *
 * Every level has two properties. "scope" and "children".
 * "scope"
 *    - contains an array of user roles. A key is accessible to only those roles
 *    - if the array is empty, that means a particular key is not a workspace level setting and won't be available in
 * "children"
 *    - This is a Map which contains details about the settings that are nested inside a parent setting
 */
let globalDefaultSetings = new Map(
  Object.entries({
    player: {
      scope: ["org-admin", "super-admin"],
      children: new Map(
        Object.entries({
          configuration: {
            scope: ["org-admin", "super-admin"],
            children: new Map(
              Object.entries({
                skipEnabled: {
                  scope: ["org-admin", "super-admin"],
                  value: skipEnabled,
                },
              })
            ),
          },
        })
      ),
    },
  })
);

export default globalDefaultSetings;
