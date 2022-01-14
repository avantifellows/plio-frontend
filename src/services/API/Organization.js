import { apiClient } from "@/services/API/RootClient.js";
import { organizationsEndpoint, organizationSettingsEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   * Update an organization's settings
   * @param {Number} orgId - id of an organization
   * @param {Object} payload - the JSON settings object
   * @returns
   */
   updateWorkspaceSettings(orgId, payload) {
    return apiClient().put(
      organizationsEndpoint + orgId + organizationSettingsEndpoint,
      payload
    );
  },
}