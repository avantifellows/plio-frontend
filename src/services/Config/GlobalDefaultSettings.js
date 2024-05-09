/** default settings */
let skipEnabled = true;
let firstTimeLanguagePickerPopup = true;
let customWebhookEnabled = false;

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
  firstTimeLanguagePickerPopup: {
    title: "settings.menu.title.firstTimeLanguagePickerPopup",
    description: "settings.menu.description.firstTimeLanguagePickerPopup",
    type: "checkbox",
  },
  customWebhook: {
    title: "settings.menu.title.customWebhook",
    description: "settings.menu.description.customWebhook",
    type: "button",
  },
};

export const webhookEvents = [
  {
    displayName: "User Authenticated",
    code: "user_authenticated",
    isSelected: false,
    description: "This event is triggered when a user is authenticated by the system",
    payloadExample: `
{
  "unique_user_id": "9999988888",
  "plio_id": "aspokqwehn",
  "timestamp": "2023-04-23T18:25:43.511Z",
  "event_type": "user_authenticated",
  "event_data": []
}
    `
  },
  {
    displayName: "Plio Loaded",
    code: "plio_loaded",
    isSelected: false,
    description: "This event is triggered when setting up of the Plio video is finished in the browser.",
    payloadExample: `
{
  "unique_user_id": "9999988888",
  "plio_id": "aspokqwehn",
  "timestamp": "2023-04-23T18:25:43.511Z",
  "event_type": "plio_loaded",
  "event_data": []
}
    `
  },
  {
    displayName: "Play Button Clicked",
    code: "play_button_clicked",
    isSelected: false,
    description: "This event is triggered when the play button is clicked by the user",
    extraData: [
      {
        code: "plio_seekbar_time",
        displayName: "Seekbar Time",
        type: "number",
        description: "The time in seconds on the video seekbar when the user clicked the play button",
      }
    ],
    payloadExample: `
{
  "unique_user_id": "9999988888",
  "plio_id": "aspokqwehn",
  "timestamp": "2023-04-23T18:25:43.511Z",
  "event_type": "play_button_clicked",
  "event_data": [
    {
      "code": "plio_seekbar_time",
      "value": 120
    }
  ]
}
    `
  },
  {
    displayName: "Pause Button Clicked",
    code: "pause_button_clicked",
    isSelected: false,
    description: "This event is triggered when the pause button is clicked by the user",
    extraData: [
      {
        code: "plio_seekbar_time",
        displayName: "Seekbar Time",
        type: "number",
        description: "The time in seconds on the video seekbar when the user clicked the pause button",
      }
    ],
    payloadExample: `
{
  "unique_user_id": "9999988888",
  "plio_id": "aspokqwehn",
  "timestamp": "2023-04-23T18:25:43.511Z",
  "event_type": "pause_button_clicked",
  "event_data": [
    {
      "code": "plio_seekbar_time",
      "value": 120
    }
  ]
}
    `
  },
  {
    displayName: "Item Opened",
    code: "item_opened",
    isSelected: false,
    description: "This event is triggered when an item/question pops up on the screen",
    extraData: [
      {
        code: "item_id",
        displayName: "Item ID",
        type: "number",
        description: "The ID of the item that has been opened. This ID can be matched with the one on BigQuery tables.",
      },
      {
        code: "item_index",
        displayName: "Item Index",
        type: "number",
        description: "The index of the item in the items array, which has been opened.",
      }
    ],
    payloadExample: `
{
  "unique_user_id": "9999988888",
  "plio_id": "aspokqwehn",
  "timestamp": "2023-04-23T18:25:43.511Z",
  "event_type": "item_opened",
  "event_data": [
    {
      "code": "item_id",
      "value": 123
    },
    {
      "code": "item_index",
      "value": 2
    }
  ]
}
    `
  }
]

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
          ui: {
            scope: ["org-admin", "super-admin"],
            children: new Map(
              Object.entries({
                firstTimeLanguagePickerPopup: {
                  scope: ["org-admin", "super-admin"],
                  value: firstTimeLanguagePickerPopup
                },
              })
            ),
          },
          advanced: {
            scope: ["org-admin", "super-admin", "only-plio-setting", "no-personal-workspace"],
            children: new Map(
              Object.entries({
                customWebhook: {
                  scope: ["org-admin", "super-admin"],
                  // value: customWebhookEnabled,
                  value: {
                    enabledEvents: ['play_button_clicked', 'user_authenticated'],
                    webhookURL: "https://www.example.com",
                  }
                }
              })
            )
          }
        })
      ),
    },
  })
);

export default globalDefaultSetings;
