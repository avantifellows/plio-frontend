import { apiClient } from "@/services/API/RootClient.js";
import {
  otpRequestEndpoint,
  otpVerifyEndpoint,
  userFromTokenEndpoint,
  usersEndpoint,
  userConfigEndpoint,
  convertTokenEndpoint,
  refreshTokenEndpoint,
  externalAuthTokenEndpoint,
  settingsEndpoint,
  organizationUsersEndpoint,
  rolesEndpoint,
} from "@/services/API/Endpoints.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
import store from "@/store";

export default {
  requestOtp(mobile) {
    // request OTP for login
    return apiClient().post(otpRequestEndpoint, {
      mobile,
    });
  },

  verifyOtp(mobile, otp) {
    // verify OTP for login
    return apiClient().post(otpVerifyEndpoint, {
      mobile,
      otp,
    });
  },

  async getUserByAccessToken(token) {
    // get user details from their access token
    return apiClient().get(userFromTokenEndpoint, {
      params: {
        token,
      },
    });
  },

  async convertSocialAuthToken(socialAuthToken) {
    // converts token from social auth to internal token
    return apiClient().post(
      convertTokenEndpoint,
      {
        grant_type: "convert_token",
        client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
        client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
        backend: "google-oauth2",
        token: socialAuthToken,
      },
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );
  },

  async generateExternalAuthToken(payload) {
    // convert third party auth token into Plio's internal token
    return apiClient().post(externalAuthTokenEndpoint, payload, {
      baseURL: process.env.VUE_APP_BACKEND_AUTH_URL,
    });
  },

  getUserConfig(userId) {
    // retrieves the config for the given user ID
    return apiClient().get(usersEndpoint + userId + userConfigEndpoint);
  },

  updateUserConfig(userId, userConfig) {
    // updates the config for the given user ID
    return apiClient().patch(usersEndpoint + userId + userConfigEndpoint, {
      config: userConfig,
    });
  },

  refreshAccessToken() {
    // if a refresh token exists locally,
    // use the stored refresh token to request for a new access token
    if (store.getters["auth/isRefreshTokenPresent"]) {
      return apiClient().post(
        refreshTokenEndpoint,
        {
          grant_type: "refresh_token",
          client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
          client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
          refresh_token: store.state.auth.accessToken.refresh_token,
        },
        { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
      );
    }

    return Promise.reject("Refresh token not found in local storage");
  },

  /**
   * @param {Number} userId - id of the user whose settings need to be updated
   * @param {Map} payload - the new value for settings
   */
  updateUserSettings(userId, payload) {
    payload = SettingsUtilities.encodeMapToPayload(payload);
    return apiClient().patch(
      usersEndpoint + userId + settingsEndpoint,
      payload
    );
  },

  /**
   * Create a new user
   * @param {Object} userData - user data (first_name, last_name, email, password, etc.)
   * @returns {Promise}
   */
  createUser(userData) {
    return apiClient().post(usersEndpoint, userData);
  },

  /**
   * Get user by email
   * @param {String} email - user email
   * @returns {Promise}
   */
  getUserByEmail(email) {
    return apiClient().get(usersEndpoint, {
      params: { email },
    });
  },

  /**
   * Get user by ID
   * @param {Number} userId - user ID
   * @returns {Promise}
   */
  getUserById(userId) {
    return apiClient().get(usersEndpoint + userId + "/");
  },

  /**
   * Bulk fetch users by IDs
   * @param {Number[]|string} ids - array of ids or comma-separated string
   */
  getUsersByIds(ids = []) {
    const params = { ids: Array.isArray(ids) ? ids.join(",") : ids };
    return apiClient().get(usersEndpoint, { params });
  },

  /**
   * Get all users that belong to a specific organization
   * @param {Number} organizationId
   */
  getUsersForOrganization(organizationId) {
    return apiClient().get(usersEndpoint, {
      params: { organization: organizationId },
    });
  },

  /**
   * Get all organization users for the current organization
   * @returns {Promise}
   */
  getOrganizationUsers(organizationId) {
    const config = organizationId
      ? { params: { organization: organizationId } }
      : undefined;
    return apiClient().get(organizationUsersEndpoint, config);
  },

  /**
   * Create organization user membership
   * @param {Object} membershipData - { user, organization, role }
   * @returns {Promise}
   */
  createOrganizationUser(membershipData) {
    return apiClient().post(organizationUsersEndpoint, membershipData);
  },

  /**
   * Update organization user membership
   * @param {Number} membershipId - organization user id
   * @param {Object} membershipData - updated data
   * @returns {Promise}
   */
  updateOrganizationUser(membershipId, membershipData) {
    return apiClient().patch(
      organizationUsersEndpoint + membershipId + "/",
      membershipData
    );
  },

  /**
   * Delete organization user membership
   * @param {Number} membershipId - organization user id
   * @returns {Promise}
   */
  deleteOrganizationUser(membershipId) {
    return apiClient().delete(organizationUsersEndpoint + membershipId + "/");
  },

  /**
   * Get all available roles
   * @returns {Promise}
   */
  getRoles() {
    return apiClient().get(rolesEndpoint);
  },
};
