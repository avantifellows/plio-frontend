import { apiClient } from "@/services/API/RootClient.js";
import {
  organizationsEndpoint,
  settingsEndpoint,
} from "@/services/API/Endpoints.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";

export default {
  /**
   * @param {Number} workspaceId - id of a workspace whose settings need to be updated
   * @param {Map} payload - the new value for settings as a Map datatype
   * @returns
   */
  updateWorkspaceSettings(workspaceId, payload) {
    payload = SettingsUtilities.encodeMapToPayload(payload);
    return apiClient().patch(
      organizationsEndpoint + workspaceId + settingsEndpoint,
      payload
    );
  },
};
