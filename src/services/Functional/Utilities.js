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
};
