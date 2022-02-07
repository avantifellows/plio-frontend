import globalDefaultSettings, {
  settingsMetadata,
} from "@/services/Config/GlobalDefaultSettings.js";
let clonedeep = require("lodash.clonedeep");

export default {
  decodeMapFromPayload,
  encodeMapToPayload,
  hasValidSettings,

  /**
   * Depending on whether the provided config is valid, this method
   * sets the plio settings according to either the provided config or the global default settings
   * @param {Object} config - Config of a plio
   * @returns
   */
  setPlioSettings(config) {
    let plioSettings = new Map();
    if (!hasValidSettings(config)) {
      // if the provided config is not valid, set plio's settings using the global defaults
      plioSettings.set(
        "player",
        clonedeep(globalDefaultSettings.get("player"))
      );
    } else {
      // if the provided config is valid, use it to set plio's settings
      plioSettings.set(
        "player",
        decodeMapFromPayload(clonedeep(config.settings)).get("player")
      );
    }
    return plioSettings;
  },

  /**
   * This method constructs the settings menu that needs to be rendered when settings menu is open.
   * We iterate through the different levels of a settings object.
   * For each of the leaf nodes, we attach some metadata to it and pass it back to the parent.
   * @param {Map} settingsToRender - the object that needs to be prepared
   * @param {Object} data - some extra data required for the preparation
   * @param {Boolean} checkUserScoping - if the user's scope has to be taken into account
   * @returns {Object} - An object with the prepared settingsToRender object along with some extra information about each leaf node
   */
  prepareSettingsToRender(settingsToRender, data, checkUserScoping = true) {
    let preparedDetails = {
      settingsToWatch: [],
    };
    // Checks if the current user has access to a particular setting level. Only valid for non personal workspace
    let doesUserHasAccessTo = (settingLevel) => {
      if (
        !data.isPersonalWorkspace &&
        settingLevel.scope.length > 0 &&
        !settingLevel.scope.includes(data.userRoleInActiveWorkspace)
      )
        return false;
      return true;
    };

    for (let [headerName, headerDetails] of settingsToRender) {
      if (checkUserScoping && !doesUserHasAccessTo(headerDetails)) {
        // in case of a workspace, we also need to check for scope. If the current user does not
        // have rights for a particular setting, we remove that key from settingsToRender
        settingsToRender.delete(headerName);
        continue;
      }
      settingsToRender.set(headerName, clonedeep(headerDetails.children));
      for (let [tabName, tabDetails] of settingsToRender.get(headerName)) {
        if (checkUserScoping && !doesUserHasAccessTo(tabDetails)) {
          // in case of a workspace, we also need to check for scope. If the current user does not
          // have rights for a particular setting, we remove that key from settingsToRender
          settingsToRender.get(headerName).delete(tabName);
          if (settingsToRender.get(headerName).size == 0)
            settingsToRender.delete(headerName);
          continue;
        }
        settingsToRender
          .get(headerName)
          .set(tabName, clonedeep(tabDetails.children));
        for (let [leafName, leafDetails] of settingsToRender
          .get(headerName)
          .get(tabName)) {
          if (checkUserScoping && !doesUserHasAccessTo(leafDetails)) {
            // in case of a workspace, we also need to check for scope. If the current user does not
            // have rights for a particular setting, we remove that key from settingsToRender
            settingsToRender.get(headerName).get(tabName).delete(leafName);
            if (settingsToRender.get(headerName).get(tabName).size == 0)
              settingsToRender.get(headerName).delete(tabName);
            continue;
          }
          // after reaching the leaf node, we add some extra data to the setting meant for rendering
          // these are the things added
          // - metadata     - contains the information on the title/description/type of the setting
          // - value        - value of that setting
          // - isWorkspaceSetting - whether this is a workspace level setting or not
          settingsToRender
            .get(headerName)
            .get(tabName)
            .set(leafName, {
              ...settingsMetadata[leafName],
              value: leafDetails.value,
              isWorkspaceSetting:
                checkUserScoping &&
                !data.isPersonalWorkspace &&
                leafDetails.scope.length > 0
                  ? true
                  : false,
            });

          let leafNodePathDetails = {
            headerName,
            tabName,
            leafName,
          };
          preparedDetails.settingsToWatch.push(leafNodePathDetails);
        }
      }
    }
    preparedDetails.settingsToRender = settingsToRender;
    return preparedDetails;
  },

  /**
   * This method merges the user's and workspace's settings.
   * This is needed to show both workspace level and user level settings in one settings menu.
   * The global default settings object is used as a structure of the keys to iterate on.
   * While iterating on the keys of the global default settings object, these rules are followed to merge
   * - If a key is not present in workspace's settings, use the key from user's settings and skip to next key
   * - If a key is present in workspace's settings, use the scope for that key and move to its children
   * - The above process is done for headers, tabs and atomic settings.
   * - For the lowest level keys (leaf nodes), use workspace's setting value if available otherwise use user's setting value
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
          // iterating on leaf nodes inside tabName
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

/**
 * Converts a plain JS object datatype that contains ordering information to a JS Map object.
 * @param {Object} data - incoming Object datatype but containing ordering information of map(s)
 * @returns - Map datatype
 */
function decodeMapFromPayload(data) {
  // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
  if (data == null) return data;
  let dataAsString = JSON.stringify(data);
  let decodedJSON = JSON.parse(dataAsString, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
        return new Map(value.value);
      }
    }
    return value;
  });
  return decodedJSON;
}

/**
 * Converts a map datatype object to an encoded plain JS object but one that enforces ordeing.
 * @param {Map} data - incoming Map datatype
 * @returns - Object datatype with map information encoded
 */
function encodeMapToPayload(data) {
  // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
  if (data == null) return data;
  let dataAsString = JSON.stringify(data, (_, value) => {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  });
  let encodedJSON = JSON.parse(dataAsString);
  return encodedJSON;
}

/**
 * checks if the provided object is a valid settings object
 * @param {Object} config - the object that needs to be checked for validity
 * @param {Array} keysToCheck - these keys should exist for the object to be valid
 * @returns {Boolean} - if the given config object contains valid settings
 */
function hasValidSettings(config, keysToCheck = ["player"]) {
  // settings key should be present inside config object
  if (config == null || !("settings" in config) || config.settings == null)
    return false;

  // decoded settings object should be an instance of Map
  let decodedSettings = decodeMapFromPayload(clonedeep(config.settings));
  if (!(decodedSettings instanceof Map)) return false;

  // certain keys should be present in the settings Map
  keysToCheck.every((key) => {
    if (!decodedSettings.has(key)) return false;
  });
  return true;
}
