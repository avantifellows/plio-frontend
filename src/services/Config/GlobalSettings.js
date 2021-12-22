/** Default values of the settings */
let skipEnabled = true
let darkModeEnabled = false


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
    subTitle: null,
    type: "checkbox",
  },
}

/**
 * The below exported object is the global settings object.
 * Different components might choose to use the full structure or a part of it as necessary.
 */
export default {
  player: {
    configuration: {
      skipEnabled: skipEnabled,
    }
  },
  app: {
    appearance: {
      darkMode: darkModeEnabled
    }
  }
}