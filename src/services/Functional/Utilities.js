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

  getIconSource(iconName) {
    // returns the source of an icon given the name
    return require(`@/assets/images/${iconName}`);
  },

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },
};
