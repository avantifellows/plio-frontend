import { apiClient } from "@/services/API/RootClient.js";
import {
  organizationsEndpoint,
  settingsEndpoint,
} from "@/services/API/Endpoints.js";
import Utilities from "@/services/Functional/Utilities.js";

export default {
  /**
   * @param {Number} orgId - id of an organization whose settings need to be updated
   * @param {Map} payload - the new value for settings as a Map datatype
   * @returns
   */
  updateWorkspaceSettings(orgId, payload) {
    payload = Utilities.encodeMapToPayload(payload);
    return apiClient().patch(
      organizationsEndpoint + orgId + settingsEndpoint,
      payload
    );
  },
};
