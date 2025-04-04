// useCreatePlio.js
import PlioAPIService from "@/services/API/Plio.js";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useStore } from "vuex";

export function useCreatePlio() {
  const router = useRouter();
  const toast = useToast();
  const store = useStore();

  const createNewPlio = async (isPersonalWorkspace, userSettings, activeWorkspaceSettings, activeWorkspace, mixpanel, progress) => {
    progress.start();
    mixpanel.track("Click Create");
    mixpanel.people.set_once({ "First Plio Created": new Date().toISOString() });
    mixpanel.people.set({ "Last Plio Created": new Date().toISOString() });
    mixpanel.people.increment("Total Plios Created");

    const createPlioResponse = await PlioAPIService.createPlio();

    progress.finish();

    if (createPlioResponse.status === 201) {
      const plioUuid = createPlioResponse.data.uuid;
      const newPlioSettings = isPersonalWorkspace
        ? userSettings.get("player")
        : activeWorkspaceSettings.get("player");

      const updatePlioSettingsResponse = await PlioAPIService.updatePlioSettings(
        plioUuid,
        new Map(Object.entries({ player: newPlioSettings }))
      );

      if (updatePlioSettingsResponse.status === 200) {
        router.push({
          name: "Editor",
          params: { plioId: plioUuid, workspace: activeWorkspace },
        });
      }
    } else {
      toast.error("Error creating plio");
    }
  };

  return {
    createNewPlio,
  };
}
