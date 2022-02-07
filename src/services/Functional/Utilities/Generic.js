import axios from "axios";
import dayjs from "dayjs";
import ErrorHandling from "@/services/API/ErrorHandling.js";

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
};

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
