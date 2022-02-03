import { apiClient } from "@/services/API/RootClient.js";
import {
  organizationsEndpoint,
  settingsEndpoint,
} from "@/services/API/Endpoints.js";
import Utilities from "@/services/Functional/Utilities.js";

export default {
  /**
   * @param {Number} workspaceId - id of a workspace whose settings need to be updated
   * @param {Map} payload - the new value for settings as a Map datatype
   * @returns
   */
  updateWorkspaceSettings(workspaceId, payload) {
    payload = Utilities.encodeMapToPayload(payload);
    return apiClient().patch(
      organizationsEndpoint + workspaceId + settingsEndpoint,
      payload
    );
  },
};
