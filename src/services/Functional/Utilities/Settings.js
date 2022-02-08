import store from "@/store";
import globalDefaultSettings, {
  settingsMetadata,
} from "@/services/Config/GlobalDefaultSettings.js";
let clonedeep = require("lodash.clonedeep");

export default {
  isSettingApplicableToWorkspace(settingScope) {
    return settingScope.length != 0;
  },
  /**
   * Converts a plain JS object datatype that contains ordering information to a JS Map object.
   * @param {Object} data - incoming Object datatype but containing ordering information of map(s)
   * @returns - Map instance
   */
  decodeMapFromPayload(data) {
    // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
    if (data == null) return data;
    let dataAsString = JSON.stringify(data);
    let decodedJSON = JSON.parse(dataAsString, (_, value) => {
      if (typeof value === "object" && value !== null) {
        if (value.dataType === "Map") {
          return new Map(value.data);
        }
      }
      return value;
    });
    return decodedJSON;
  },

  /**
   * Converts a Map to an encoded plain JS object but one that enforces ordeing.
   * @param {Map} data - incoming Map instance
   * @returns - Object datatype with map information encoded
   */
  encodeMapToPayload(data) {
    // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
    if (data == null) return data;
    let dataAsString = JSON.stringify(data, (_, value) => {
      if (value instanceof Map) {
        return {
          dataType: "Map",
          data: Array.from(value.entries()),
        };
      } else {
        return value;
      }
    });
    let encodedJSON = JSON.parse(dataAsString);
    return encodedJSON;
  },

  /**
   * checks if the provided object is a valid settings object
   * @param {Object} config - the object that needs to be checked for validity
   * @param {Array} keysToCheck - these keys should exist for the object to be valid
   * @returns {Boolean} - if the given config object contains valid settings
   */
  hasValidSettings(config, keysToCheck = ["player"]) {
    // settings key should be present inside config object
    if (config == null || !("settings" in config) || config.settings == null)
      return false;

    // decoded settings object should be an instance of Map
    let decodedSettings = this.decodeMapFromPayload(clonedeep(config.settings));
    if (!(decodedSettings instanceof Map)) return false;

    // certain keys should be present in the settings Map
    for (const key of keysToCheck) if (!decodedSettings.has(key)) return false;
    return true;
  },

  /**
   * Depending on whether the provided config is valid, this method
   * sets the plio settings according to either the provided config or the global default settings
   * @param {Object} config - Config of a plio
   */
  setPlioSettings(config) {
    let plioSettings = new Map();
    if (!this.hasValidSettings(config)) {
      // if the provided config is not valid, set plio's settings using the global defaults
      plioSettings.set(
        "player",
        clonedeep(globalDefaultSettings.get("player"))
      );
    } else {
      // if the provided config is valid, use it to set plio's settings
      plioSettings.set(
        "player",
        this.decodeMapFromPayload(clonedeep(config.settings)).get("player")
      );
    }
    return plioSettings;
  },

  /**
   * This method constructs the settings menu that needs to be rendered when settings menu is open.
   * We iterate through the different levels of a settings object.
   * For each of the leaf settings, we attach some metadata to it and pass it back to the parent.
   * @param {Map} settingsToRender - the object that needs to be prepared
   * @param {Boolean} checkUserScoping - if the user's scope has to be taken into account
   */
  prepareSettingsToRender(settingsToRender, checkUserScoping = true) {
    // Checks if the current user has access to a particular setting level. Only valid for non personal workspace
    let canUserAccess = (settingLevel) => {
      if (
        !store.getters["auth/isPersonalWorkspace"] &&
        this.isSettingApplicableToWorkspace(settingLevel.scope) &&
        !settingLevel.scope.includes(
          store.getters["auth/userRoleInActiveWorkspace"]
        )
      )
        return false;
      return true;
    };

    for (let [headerName, headerDetails] of settingsToRender) {
      if (checkUserScoping && !canUserAccess(headerDetails)) {
        // in case of a workspace, we also need to check for scope. If the current user does not
        // have rights for a particular setting, we remove that key from settingsToRender
        settingsToRender.delete(headerName);
        continue;
      }
      settingsToRender.set(headerName, clonedeep(headerDetails.children));
      for (let [tabName, tabDetails] of settingsToRender.get(headerName)) {
        if (checkUserScoping && !canUserAccess(tabDetails)) {
          // in case of a workspace, we also need to check for scope. If the current user does not
          // have rights for a particular setting, we remove that key from settingsToRender
          settingsToRender.get(headerName).delete(tabName);
          continue;
        }
        settingsToRender
          .get(headerName)
          .set(tabName, clonedeep(tabDetails.children));
        for (let [leafName, leafDetails] of settingsToRender
          .get(headerName)
          .get(tabName)) {
          if (checkUserScoping && !canUserAccess(leafDetails)) {
            // in case of a workspace, we also need to check for scope. If the current user does not
            // have rights for a particular setting, we remove that key from settingsToRender
            settingsToRender.get(headerName).get(tabName).delete(leafName);
            continue;
          }
          // after reaching the leaf, we add some extra data to the setting meant for rendering
          // - metadata: contains the information on the title/description/type of the setting
          // - value: value of that setting
          // - isWorkspaceSetting: whether this is a workspace level setting or not
          settingsToRender
            .get(headerName)
            .get(tabName)
            .set(leafName, {
              ...settingsMetadata[leafName],
              value: leafDetails.value,
              isWorkspaceSetting:
                checkUserScoping &&
                !store.getters["auth/isPersonalWorkspace"] &&
                this.isSettingApplicableToWorkspace(leafDetails.scope)
                  ? true
                  : false,
            });
        }
        if (settingsToRender.get(headerName).get(tabName).size == 0)
          settingsToRender.get(headerName).delete(tabName);
      }
      if (settingsToRender.get(headerName).size == 0)
        settingsToRender.delete(headerName);
    }
  },

  /**
   * This method merges the user's and workspace's settings.
   * This is needed to show both workspace level and user level settings in one settings menu.
   * The global default settings object is used as a structure of the keys to iterate on.
   * While iterating on the keys of the global default settings object, these rules are followed to merge
   * - If a key is not present in workspace's settings, use the key from user's settings and skip to next key
   * - If a key is present in workspace's settings, use the scope for that key and move to its children
   * - The above process is done for headers, tabs and leaf settings.
   * - For the lowest level keys (leaves), use workspace's setting value if available otherwise use user's setting value
   *
   * @param {Object} userSettings - User's version of settings
   * @param {Object} workspaceSettings - workspace's version of settings
   * @returns {Object} An object with user's and workspace's settings merged (with workspace's settings taking priority)
   */
  mergeSettings(userSettings, workspaceSettings) {
    // making a deep clone of global default settings.
    // the keys/values will be removed/updated according to user/workspace settings as we iterate
    let mergedSettings = clonedeep(globalDefaultSettings);
    for (let [headerName, headerDetails] of mergedSettings) {
      // iterating on headers
      let workspaceHeaders = [...workspaceSettings.keys()];
      if (!workspaceHeaders.includes(headerName)) {
        // if the current header name is not present in workspace settings,
        // pick the details from user's settings and put it into merged settings object
        mergedSettings.set(headerName, userSettings.get(headerName));
        continue;
      }
      // if the current header name is present in workspace settings, use its scope information
      mergedSettings.get(headerName).scope = workspaceSettings.get(
        headerName
      ).scope;

      for (let [tabName, tabDetails] of headerDetails.children) {
        // iterating on tabs inside headerName
        let workspaceTabs = [
          ...workspaceSettings.get(headerName).children.keys(),
        ];
        if (!workspaceTabs.includes(tabName)) {
          // if the current tab name is not present in workspace settings,
          // pick the details from user's settings and put it into merged settings object
          mergedSettings
            .get(headerName)
            .children.set(
              tabName,
              userSettings.get(headerName).children.get(tabName)
            );
          continue;
        }
        // if the current tab name IS present in workspace settings, use its scope information
        mergedSettings
          .get(headerName)
          .children.get(tabName).scope = workspaceSettings
          .get(headerName)
          .children.get(tabName).scope;

        for (let [leafName] of tabDetails.children) {
          // iterating on leaves inside tabName
          let workspaceLeafs = [
            ...workspaceSettings
              .get(headerName)
              .children.get(tabName)
              .children.keys(),
          ];
          // if the current leaf name is not present in workspace settings,
          // pick the details from user's settings else pick it up from
          // workspace's settings and put it into merged settings object
          let validLeafDetails = workspaceLeafs.includes(leafName)
            ? workspaceSettings
                .get(headerName)
                .children.get(tabName)
                .children.get(leafName)
            : userSettings
                .get(headerName)
                .children.get(tabName)
                .children.get(leafName);

          mergedSettings
            .get(headerName)
            .children.get(tabName)
            .children.set(leafName, validLeafDetails);
        }
      }
    }
    return mergedSettings;
  },
};
