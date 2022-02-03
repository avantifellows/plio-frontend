import axios from "axios";
import dayjs from "dayjs";
import ErrorHandling from "@/services/API/ErrorHandling.js";
import globalDefaultSettings, {
  settingsMetadata,
} from "@/services/Config/GlobalDefaultSettings.js";

let clonedeep = require("lodash.clonedeep");
var duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

export default {
  /**
   * Returns the link to the Player for a plio
   *
   * @param {String} plioId - ID of the plio whose player link is needed
   * @param {String} activeWorkspace - the currently active workspace
   * @returns {String}
   */
  getPlioLink(plioId, activeWorkspace) {
    if (plioId == "") return "";
    let baseURL = process.env.VUE_APP_FRONTEND;
    baseURL = baseURL.replace("http://", "");
    baseURL = baseURL.replace("https://", "");
    if (activeWorkspace != "") baseURL += "/" + activeWorkspace;
    return baseURL + "/play/" + plioId;
  },

  /**
   * Returns the link to the Editor for a plio
   *
   * @param {String} plioId - ID of the plio whose editor link is needed
   * @param {String} activeWorkspace - the currently active workspace
   * @returns {String}
   */
  getPlioDraftLink(plioId, activeWorkspace) {
    return this.getPlioLink(plioId, activeWorkspace).replace("play", "edit");
  },

  /**
   * Returns the embed link for a plio
   *
   * @param {String} plioId - ID of the plio for which the embed code is needed
   * @param {String} activeWorkspace - the currently active workspace
   * @returns {String}
   */
  getPlioEmbedLink(plioId, activeWorkspace) {
    if (plioId == "") return "";
    let baseURL = process.env.VUE_APP_FRONTEND;
    if (activeWorkspace != "") baseURL += "/" + activeWorkspace;
    return baseURL + "/plio/" + plioId;
  },

  /**
   * adds SSO params to the given link
   * prefills the api key if it is given
   *
   * @param {String} link - the link to add the SSO params to
   * @param {String} activeWorkspaceApiKey - api key to be used in the modified link
   * @returns {String}
   */
  addSSOParamsToLink(link, activeWorkspaceApiKey = null) {
    const api_key =
      activeWorkspaceApiKey != null ? activeWorkspaceApiKey : "YOUR_API_KEY";
    return `${link}?api_key=${api_key}&unique_id=UNIQUE_ID`;
  },

  /**
   * Returns the code for embedding a plio
   *
   * @param {String} plioId - ID of the plio for which the embed code is needed
   * @param {String} activeWorkspace - the currently active workspace
   * @param {Boolean} sso - whether the embed code should contain SSO params
   * @param {String} activeWorkspaceApiKey - api key to be used in the embed code if using SSO
   * @returns {String}
   */
  getEmbedCode(
    plioId,
    activeWorkspace,
    sso = false,
    activeWorkspaceApiKey = null
  ) {
    let plioEmbedLink = this.getPlioEmbedLink(plioId, activeWorkspace);
    if (sso)
      plioEmbedLink = this.addSSOParamsToLink(
        plioEmbedLink,
        activeWorkspaceApiKey
      );
    return `<iframe src='${plioEmbedLink}' width=100% height=640px></iframe>`;
  },

  /**
   * Get the source path of an image
   *
   * @param {String} imageName - name of the image under src/assets/images
   * @returns {String}
   */
  getImageSource(imageName) {
    return require(`@/assets/images/${imageName}`);
  },

  /**
   * Checks if an object is empty
   *
   * @param {Object} obj - the object to be inspected
   * @returns {Boolean}
   */
  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },

  /**
   * Copies the given value to the clipboard
   *
   * @param {String} value - the value to be copied
   * @returns {Boolean} whether the value was successfully copied
   */
  copyToClipboard(value) {
    let hiddenElement = document.createElement("textarea");
    document.body.appendChild(hiddenElement);
    hiddenElement.value = value;
    hiddenElement.select();
    let success = document.execCommand("copy");
    document.body.removeChild(hiddenElement);
    return success;
  },

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
        // in case of an org workspace, we also need to check for scope. If the current user does not
        // have rights for a particular setting, we remove that key from settingsToRender
        settingsToRender.delete(headerName);
        continue;
      }
      settingsToRender.set(headerName, clonedeep(headerDetails.children));
      for (let [tabName, tabDetails] of settingsToRender.get(headerName)) {
        if (!doesUserHasAccessTo(tabDetails)) {
          // in case of an org workspace, we also need to check for scope. If the current user does not
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
            // in case of an org workspace, we also need to check for scope. If the current user does not
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
          // - isOrgSetting - whether this is an org level setting or not
          settingsToRender
            .get(headerName)
            .get(tabName)
            .set(leafName, {
              ...settingsMetadata[leafName],
              value: leafDetails.value,
              isOrgSetting:
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
  let decodedJSON = JSON.parse(dataAsString, mapReviver);
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
  let dataAsString = JSON.stringify(data, mapReplacer);
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
  keysToCheck.forEach((key) => {
    if (!decodedSettings.has(key)) return false;
  });

  return true;
}

/**
 * An identifier to hold the current animation frame request.
 * useful when it's needed to cancel a particular animation frame
 */
export let animationFrameRequest = null;

/**
 * Animates confetti gun for a certain amount of time
 * @param {Object} confettiHandler - Handler which will draw the confetti on the canvas
 * @param {Number} duration - How long the confetti should be animated for
 * @param {Array} colors - Colors for the confetti
 */
export function throwConfetti(
  confettiHandler,
  duration = 3,
  colors = ["#ff718d", "#fdff6a"]
) {
  const animationEndTime = Date.now() + duration * 1000;
  const frame = () => {
    confettiHandler({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confettiHandler({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < animationEndTime) {
      // store the animation frame request in a variable
      // so we can cancel it later on
      animationFrameRequest = requestAnimationFrame(frame);
    }
  };
  frame();
}

/**
 * Resets the animation frame request for the confetti being rendered
 */
export function resetConfetti() {
  if (animationFrameRequest != undefined)
    cancelAnimationFrame(animationFrameRequest);
}

/**
 * custom logic for deciding when the screen is considered to be in portrait mode
 */
export function isScreenPortrait() {
  if (screen.availHeight > 0.8 * screen.availWidth) return true;
  return false;
}

/**
 * Converts a timestamp in seconds to ISO format
 * @param {Number} timeInSeconds - A timestamp value in seconds
 * @returns {Object} - The converted timestamp in ISO format
 */
export function convertSecondsToISOTime(timeInSeconds) {
  // reference -
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript

  let timestampObject = {
    hour: null,
    minute: null,
    second: null,
    millisecond: null,
    /**
     * Converts the time component from a Number to a String and pads it with zeros accordingly
     * @param {String} timeComponent - "hour", "minute", "second" or "millisecond"
     * @returns {String} - A string padded on the start with zeroes depending on the time component
     */
    getAsString(timeComponent) {
      let targetLength = timeComponent == "millisecond" ? 3 : 2;
      return String(this[timeComponent]).padStart(targetLength, "0");
    },
  };
  let isoTime = new Date(Math.floor(timeInSeconds) * 1000)
    .toISOString()
    .substr(11, 8);

  timestampObject.hour = parseInt(isoTime.split(":")[0]);
  timestampObject.minute = parseInt(isoTime.split(":")[1]);
  timestampObject.second = parseInt(isoTime.split(":")[2]);
  timestampObject.millisecond = 0;

  if (Math.floor(timeInSeconds) < timeInSeconds)
    timestampObject.millisecond = parseInt(
      String(timeInSeconds).split(".")[1].padEnd(3, "0")
    );

  return timestampObject;
}

/**
 * Converts a timestamp in ISO format to seconds
 * @param {Object} timeInISO - An object containing the ISO time as its keys
 * @returns {Number} - The converted time in seconds
 */
export function convertISOTimeToSeconds(timeInISO) {
  let hour = parseInt(timeInISO.hour) || 0;
  let minute = parseInt(timeInISO.minute) || 0;
  let second = parseInt(timeInISO.second) || 0;
  let millisecond = parseInt(timeInISO.millisecond) || 0;
  return hour * 3600 + minute * 60 + second + millisecond / 1000;
}

/**
 * Helper function for stringifying a nested Map JS object
 * @param {Map} value - A Map object that needs to be stringified
 * @returns
 */
function mapReplacer(_, value) {
  // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

/**
 * Helper function for parsing a string into a JS object that contains information abobut JS Map datatype
 * @param {String} value - A string that needs to be parsed
 * @returns
 */
function mapReviver(_, value) {
  // refer - https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map/56150320#56150320
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

/**
 * Get duration of a YouTube video in seconds
 * @param {String} videoId - the unique id of the video on youtube
 */
export async function getVideoDuration(videoId) {
  let nonExistingVideoError = "video does not exist";
  try {
    let response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          id: videoId,
          part: "contentDetails",
          key: process.env.VUE_APP_GOOGLE_API_KEY,
        },
      }
    );

    let items = response.data["items"];
    if (items.length === 0) throw new Error(nonExistingVideoError);
    return dayjs.duration(items[0]["contentDetails"]["duration"]).asSeconds();
  } catch (error) {
    if (error.message == nonExistingVideoError)
      throw new Error(nonExistingVideoError);
    ErrorHandling.handleAPIErrors(error);
  }
}
