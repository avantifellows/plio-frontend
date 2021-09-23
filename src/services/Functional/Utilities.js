export default {
  /**
   * Returns the link to the Player for a plio
   *
   * @param {String} plioId ID of the plio for which the embed code is needed
   * @param {String} activeWorkspace the currently active workspace
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
   * Returns the embed link for a plio
   *
   * @param {String} plioId ID of the plio for which the embed code is needed
   * @param {String} activeWorkspace the currently active workspace
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
   * @param {String} link the link to add the SSO params to
   * @param {String} activeWorkspaceApiKey api key to be used in the modified link
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
   * @param {String} plioId ID of the plio for which the embed code is needed
   * @param {String} activeWorkspace the currently active workspace
   * @param {Boolean} sso whether the embed code should contain SSO params
   * @param {String} activeWorkspaceApiKey api key to be used in the embed code if using SSO
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
   * @param {String} imageName name of the image under src/assets/images
   * @returns {String}
   */
  getImageSource(imageName) {
    return require(`@/assets/images/${imageName}`);
  },

  /**
   * Checks if an object is empty
   *
   * @param {Object} obj the object to be inspected
   * @returns {Boolean}
   */
  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },

  /**
   * Copies the given value to the clipboard
   *
   * @param {String} value the value to be copied
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
