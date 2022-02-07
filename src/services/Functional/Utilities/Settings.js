import globalDefaultSettings, {
  settingsMetadata,
} from "@/services/Config/GlobalDefaultSettings.js";
let clonedeep = require("lodash.clonedeep");

export default {
  decodeMapFromPayload,
  encodeMapToPayload,
  doesObjectContainValidSettings,

  /**
   * Depending on wheather the provided config is valid, this methods
   * sets the plio settings according to either the provided config or the global default settings
   * @param {Object} config - Config of a plio
   * @returns
   */
  setPlioSettings(config) {
    let plioSettings = new Map();
    if (!doesObjectContainValidSettings(config)) {
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
   * @returns {Object} - An object with the prepared settingsToRender object along with some extra information about each leaf node
   */
  prepareSettingsToRender(settingsToRender, data) {
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
      if (!doesUserHasAccessTo(headerDetails)) {
        // in case of a workspace, we also need to check for scope. If the current user does not
        // have rights for a particular setting, we remove that key from settingsToRender
        settingsToRender.delete(headerName);
        continue;
      }
      settingsToRender.set(headerName, clonedeep(headerDetails.children));
      for (let [tabName, tabDetails] of settingsToRender.get(headerName)) {
        if (!doesUserHasAccessTo(tabDetails)) {
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
          if (!doesUserHasAccessTo(leafDetails)) {
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
                !data.isPersonalWorkspace && leafDetails.scope.length > 0
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
 * Checks if the provided object is a valid settings object
 * @param {Object} config - The object that needs to be checked for validity
 * @param {Array} keysToCheck - These keys should exist for the object to be valid
 * @returns {Boolean}
 */
function doesObjectContainValidSettings(config, keysToCheck = ["player"]) {
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
