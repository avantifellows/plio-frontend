export default {
  getPlioLink(plioId, activeWorkspace) {
    // prepare the link for the plio from the plio ID and activeWorkspace
    if (plioId == "") return "";
    var baseURL = process.env.VUE_APP_FRONTEND + "/#";
    baseURL = baseURL.replace("http://", "");
    baseURL = baseURL.replace("https://", "");
    if (activeWorkspace != "") baseURL += "/" + activeWorkspace;
    return baseURL + "/play/" + plioId;
  },

  getPlioEmbedLink(plioId, activeWorkspace) {
    // get the link for embedding the plio from the plio ID and activeWorkspace
    if (plioId == "") return "";
    var baseURL = process.env.VUE_APP_FRONTEND + "/#";
    if (activeWorkspace != "") baseURL += "/" + activeWorkspace;
    return baseURL + "/plio/" + plioId;
  },

  addSSOParamsToLink(link, activeWorkspaceApiKey = null) {
    const api_key =
      activeWorkspaceApiKey != null ? activeWorkspaceApiKey : "YOUR_API_KEY";
    return `${link}?api_key=${api_key}&unique_id=UNIQUE_ID`;
  },

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

  getIconSource(iconName) {
    // returns the source of an icon given the name
    return require(`@/assets/images/${iconName}`);
  },

  isObjectEmpty(obj) {
    // checks if an object (`obj`) is empty
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },

  copyToClipboard(value) {
    // copies the value to the clipboard
    var hiddenElement = document.createElement("textarea");
    document.body.appendChild(hiddenElement);
    hiddenElement.value = value;
    hiddenElement.select();
    var success = document.execCommand("copy");
    document.body.removeChild(hiddenElement);
    return success;
  },
};
