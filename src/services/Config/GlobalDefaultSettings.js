/** Default values of the settings */
let skipEnabled = true;

/**
 * This object contains a mapping of SETTING_NAME and SETTING_METADATA
 * The metadata includes all details necessary for rendering a particular setting
 * on the settings menu.
 *
 * "title" - The locale path of the title of a setting that will be shown on the main panel of the menu.
 * "subTitle" - The locale path of the subtitle to the above title
 * "type" - The type of the setting. Options can be - checkbox, range, text, number etc
 */
export let settingsMetadata = {
  skipEnabled: {
    title: "settings.menu.title.skipEnabled",
    subTitle: "settings.menu.subTitle.skipEnabled",
    type: "checkbox",
  },
  darkMode: {
    title: "settings.menu.title.darkMode",
    subTitle: "settings.menu.subTitle.darkMode",
    type: "checkbox",
  },
};

/**
 * The below exported object is the global default settings object.
 * Different components might choose to use the full structure or a part of it as necessary.
 * There are three levels
 * - Headers: (eg- player, app etc...)
 * - Tabs: (eg- configuration, appearance etc...)
 * - Settings: (eg- skipEnabled, darkMode etc...)
 * 
 * Every level has two properties. "scope" and "children".
 * "scope" 
 *    - contains an array of user roles. A key is accessible to only those roles
 *    - if the array is empty, that means a particular key is not an org level setting
 * "children"
 *    - contains details about the nested settings
 */
export default {
  player: {
    scope: ["org-admin", "super-admin"],
    children: {
      configuration: {
        scope: ["org-admin", "super-admin"],
        children: {
          skipEnabled: {
            scope: ["org-admin", "super-admin"],
            value: skipEnabled,
          }
        }
      }, 
    }
  },
  app: {
    scope: [],
    children: {
      appearance: {
        scope: [],
        children: {
          darkMode: {
            scope: [],
            value: false,
          }
        }
      }, 
    }
  },
};
