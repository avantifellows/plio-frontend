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
    var baseURL = process.env.VUE_APP_FRONTEND + "/#";
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
    var baseURL = process.env.VUE_APP_FRONTEND + "/#";
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
    var hiddenElement = document.createElement("textarea");
    document.body.appendChild(hiddenElement);
    hiddenElement.value = value;
    hiddenElement.select();
    var success = document.execCommand("copy");
    document.body.removeChild(hiddenElement);
    return success;
  },
};

/**
 * An identifier to hold the current animation frame request.
 * useful when it's needed to cancel a particular animation frame
 */
export var animationFrameRequest = null;

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
