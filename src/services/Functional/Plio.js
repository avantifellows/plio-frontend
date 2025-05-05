import PlioAPIService from "@/services/API/Plio.js";
import { useToast } from "vue-toastification";
import router from "@/router";
import store from "@/store";

export default {
  /**
   * Creates a new draft plio and redirects the user to the editor
   * @param {Object} app - The Vue app instance (for accessing $Progress, $mixpanel, $router, and $t)
   * @returns {Promise<boolean>} - Returns true if successful, false otherwise
   */
  async createNewPlio(app) {
    const toast = useToast();

    app.$Progress.start();
    app.$mixpanel.track("Click Create");
    app.$mixpanel.people.set_once({
      "First Plio Created": new Date().toISOString(),
    });
    app.$mixpanel.people.set({
      "Last Plio Created": new Date().toISOString(),
    });
    app.$mixpanel.people.increment("Total Plios Created");

    const activeWorkspace = store.state.auth.activeWorkspace;
    const user = store.state.auth.user;

    // Check if the user is in the active workspace (App.vue specific check)
    if (user && user.organizations) {
      const isUserInWorkspace = user.organizations.some((organization) => {
        // No need to redirect if the user belongs to the workspace
        // or the user is in the personal workspace
        return (
          organization.shortcode == activeWorkspace || activeWorkspace == ""
        );
      });

      if (!isUserInWorkspace) {
        await store.dispatch("auth/unsetActiveWorkspace");
      }
    }

    try {
      const createPlioResponse = await PlioAPIService.createPlio();

      if (createPlioResponse.status === 201) {
        // Once the plio is created, update its settings as well
        const plioUuid = createPlioResponse.data.uuid;
        const isPersonalWorkspace = store.getters["auth/isPersonalWorkspace"];
        const userSettings = store.state.auth.userSettings;
        const activeWorkspaceSettings =
          store.getters["auth/activeWorkspaceSettings"];

        const newPlioSettings = isPersonalWorkspace
          ? userSettings.get("player")
          : activeWorkspaceSettings.get("player");

        const updatePlioSettingsResponse =
          await PlioAPIService.updatePlioSettings(
            plioUuid,
            new Map(
              Object.entries({
                player: newPlioSettings,
              })
            )
          );

        if (updatePlioSettingsResponse.status === 200) {
          router.push({
            name: "Editor",
            params: { plioId: plioUuid, workspace: activeWorkspace },
          });

          app.$Progress.finish();
          return true;
        }
      }

      app.$Progress.finish();
      toast.error(app.$t("toast.error.create_plio"));
      return false;
    } catch (error) {
      app.$Progress.finish();
      toast.error(app.$t("toast.error.create_plio"));
      return false;
    }
  },
};
