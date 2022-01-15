import { mount, flushPromises } from "@vue/test-utils";
import UserAPIService from "@/services/API/User.js";
import router from "@/router";
import store from "@/store";
import App from "@/App";
import Settings from "@/components/Collections/Settings/Settings.vue";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";

import mockAxios from "jest-mock-axios";
import clonedeep from "lodash/cloneDeep";

describe("App.vue for unauthenticated user", () => {
  let wrapper;

  it("should render", async () => {
    router.push("/");

    wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.vm.isAuthenticated).toBeFalsy();
  });
});

describe("App.vue for authenticated user", () => {
  let wrapper;

  const dialogTitle = "testTitle";
  const dialogDescription = "testDescription";
  const confirmButtonConfig = {
    enabled: true,
    text: "Cancel",
    class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
  };
  const cancelButtonConfig = {
    enabled: true,
    text: "Cancel",
    class: "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
  };

  beforeEach(async () => {
    // mock user service
    jest
      .spyOn(UserAPIService, "getUserByAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: global.dummyUser });
        });
      });

    // set user
    await store.dispatch("auth/setAccessToken", global.dummyAccessToken);

    router.push("/home");

    wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    // After this line, router is ready
    await router.isReady();

    // set user
    await store.dispatch("auth/setUser", global.dummyUser);

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(
      clonedeep(global.dummyEmptyPlioList),
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();
  });

  it("should render", async () => {
    expect(wrapper.vm.isAuthenticated).toBeTruthy();
  });

  it("shows dialog box correctly", async () => {
    // dialog box shouldn't be shown at first
    expect(wrapper.vm.isDialogBoxShown).toBeFalsy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();

    // set the properties of the dialog box and show it
    await store.dispatch("dialog/setDialogTitle", dialogTitle);
    await store.dispatch("dialog/setDialogDescription", dialogDescription);
    await store.dispatch("dialog/setConfirmButtonConfig", confirmButtonConfig);
    await store.dispatch("dialog/setCancelButtonConfig", cancelButtonConfig);
    await store.dispatch("dialog/showDialogBox");

    // the dialog box should be shown now
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    // all the values for the dialog box should be set appropriately
    let dialogBoxComponent = wrapper.getComponent({ name: "DialogBox" });
    expect(dialogBoxComponent.props("title")).toBe(dialogTitle);
    expect(dialogBoxComponent.props("description")).toBe(dialogDescription);
    expect(dialogBoxComponent.props("confirmButtonConfig")).toStrictEqual(
      confirmButtonConfig
    );
    expect(dialogBoxComponent.props("cancelButtonConfig")).toStrictEqual(
      cancelButtonConfig
    );
    expect(dialogBoxComponent.props("isCloseButtonShown")).toBeFalsy();
  });

  describe("dialog box", () => {
    beforeEach(async () => {
      await store.dispatch("dialog/setDialogTitle", dialogTitle);
      await store.dispatch("dialog/setDialogDescription", dialogDescription);
      await store.dispatch(
        "dialog/setConfirmButtonConfig",
        confirmButtonConfig
      );
      await store.dispatch("dialog/setCancelButtonConfig", cancelButtonConfig);
      await store.dispatch("dialog/showDialogBox");
    });

    it("clicking cancel closes dialog and sets cancel click status", async () => {
      // cancel click status should be false at the start
      expect(store.state.dialog.isCancelClicked).toBeFalsy();

      // click the cancel button of the dialog box
      await wrapper
        .find('[data-test="dialogBox"]')
        .find('[data-test="cancelButton"]')
        .trigger("click");
      await flushPromises();

      // properties must be unset and cancel click status must be set
      expect(wrapper.vm.isDialogBoxShown).toBeFalsy();
      expect(wrapper.vm.dialogTitle).toBeFalsy();
      expect(wrapper.vm.dialogDescription).toBeFalsy();
      expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeFalsy();
      expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeFalsy();
      expect(store.state.dialog.isCancelClicked).toBeTruthy();
    });

    it("clicking confirm closes dialog and sets confirm click status", async () => {
      // confirm click status should be false at the start
      expect(store.state.dialog.isConfirmClicked).toBeFalsy();

      // click the confirm button of the dialog box
      await wrapper
        .find('[data-test="dialogBox"]')
        .find('[data-test="confirmButton"]')
        .trigger("click");
      await flushPromises();

      // properties must be unset and confirm click status must be set
      expect(wrapper.vm.isDialogBoxShown).toBeFalsy();
      expect(wrapper.vm.dialogTitle).toBeFalsy();
      expect(wrapper.vm.dialogDescription).toBeFalsy();
      expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeFalsy();
      expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeFalsy();
      expect(store.state.dialog.isConfirmClicked).toBeTruthy();
    });
  });

  describe("settings", () => {
    let loginNewUser = async (user) => {
      jest.restoreAllMocks();
      // mock the API call to get the user and provide our created user as fake data
      jest
        .spyOn(UserAPIService, "getUserByAccessToken")
        .mockImplementation(() => {
          return new Promise((resolve) => {
            resolve({ data: user });
          });
        });

      // destroy the wrapper
      if (wrapper != undefined) wrapper.unmount();

      // set the new user
      await store.dispatch("auth/setAccessToken", global.dummyAccessToken);
      router.push("/home");
      wrapper = mount(App, {
        global: {
          plugins: [router],
        },
      });

      // After this line, router is ready
      await router.isReady();

      // resolve the `GET` request waiting in the queue
      // using the fake response data
      mockAxios.mockResponse(
        clonedeep(global.dummyEmptyPlioList),
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();
    };

    beforeEach(async () => {
      jest.restoreAllMocks();
      await store.dispatch("auth/setActiveWorkspace", "");
    });

    afterEach(async () => {
      await store.dispatch("auth/setActiveWorkspace", "");
    });

    it("uses global default settings for user when it's not available in DB", () => {
      // our currently logged in user has no settings present in it's config
      // hence, it should use global default settings
      expect(wrapper.vm.userSettings).toStrictEqual(globalDefaultSettings);
      expect(store.state.auth.userSettings).toStrictEqual(
        globalDefaultSettings
      );
    });

    it("uses user's DB settings if it's available", async () => {
      // create a new user which has a setting stored in the DB different than the global setting
      let dummyUserNew = clonedeep(global.dummyUser);
      dummyUserNew.config["settings"] = clonedeep(global.dummyGlobalSettings);
      dummyUserNew.config.settings.player.children.configuration.children.skipEnabled.value = false;

      await loginNewUser(dummyUserNew);

      // our new user is set. The created userSettings should be different than the global settings
      expect(wrapper.vm.userSettings).not.toStrictEqual(
        global.dummyGlobalSettings
      );
      expect(store.state.auth.userSettings).not.toStrictEqual(
        global.dummyGlobalSettings
      );
    });

    it("uses filtered global default settings for org when it's not available in DB", async () => {
      // our currently logged in user has no settings present in it's organization's configs
      // hence, it should use global default settings
      let orgs = clonedeep(global.dummyUser.organizations);
      orgs.forEach((org) => {
        expect(store.state.auth.workspaceSettings[org.shortcode]).toStrictEqual(
          global.dummyGlobalSettingsFilteredForOrgs
        );
      });

      await store.dispatch("auth/setActiveWorkspace", "o1");
      expect(store.state.auth.activeWorkspace).toBe("o1");
      expect(store.getters["auth/activeWorkspaceSettings"]).toStrictEqual(
        global.dummyGlobalSettingsFilteredForOrgs
      );
      expect(wrapper.vm.activeWorkspaceSettings).toStrictEqual(
        global.dummyGlobalSettingsFilteredForOrgs
      );
    });

    it("uses org's DB settings if it's available", async () => {
      // create a new user which has a setting stored in one of the orgs (which came from the DB) different than the global setting
      let dummyUserClone = clonedeep(global.dummyUser);
      dummyUserClone.organizations[1].config = {
        settings: {
          player: {
            scope: ["org-admin", "super-admin"],
            children: {
              configuration: {
                scope: ["org-admin", "super-admin"],
                children: {
                  skipEnabled: {
                    scope: ["org-admin", "super-admin"],
                    value: false,
                  },
                },
              },
            },
          },
        },
      };
      await loginNewUser(dummyUserClone);

      // switch to the workspace o2
      await store.dispatch("auth/setActiveWorkspace", "o2");
      expect(store.state.auth.activeWorkspace).toBe("o2");

      // the activeWorkspaceSettings should be set to what was pulled from the DB
      expect(store.getters["auth/activeWorkspaceSettings"]).toStrictEqual(
        dummyUserClone.organizations[1].config.settings
      );
      expect(wrapper.vm.activeWorkspaceSettings).toStrictEqual(
        dummyUserClone.organizations[1].config.settings
      );
    });

    it("constructs the settings to render menu properly in personal workspace", () => {
      // the user which is set is using the global default settings
      // the settingsToRender object should contain the relevant keys and values

      let detailsInGlobalSettings = {
        headers: [],
        tabs: [],
        settings: [],
        settingValues: [],
      };
      let detailsInSettingsToRender = {
        headers: [],
        tabs: [],
        settings: [],
        settingValues: [],
      };
      // iterating both global default settings and the settingsToRender object,
      // and filling up the details in respective objects
      for (let [headerName, headerDetails] of Object.entries(
        globalDefaultSettings
      )) {
        detailsInGlobalSettings.headers.push(headerName);
        for (let [tabName, tabDetails] of Object.entries(
          headerDetails.children
        )) {
          detailsInGlobalSettings.tabs.push(tabName);
          for (let [settingName, settingDetails] of Object.entries(
            tabDetails.children
          )) {
            detailsInGlobalSettings.settings.push(settingName);
            detailsInGlobalSettings.settingValues.push(settingDetails.value);
          }
        }
      }

      for (let [headerName, headerDetails] of Object.entries(
        wrapper.vm.settingsToRender
      )) {
        detailsInSettingsToRender.headers.push(headerName);
        for (let [tabName, tabDetails] of Object.entries(headerDetails)) {
          detailsInSettingsToRender.tabs.push(tabName);
          for (let [settingName, settingDetails] of Object.entries(
            tabDetails
          )) {
            detailsInSettingsToRender.settings.push(settingName);
            detailsInSettingsToRender.settingValues.push(settingDetails.value);
          }
        }
      }
      // All the details should match
      expect(detailsInSettingsToRender).toStrictEqual(detailsInGlobalSettings);
    });

    it("shows all settings, even org level settings, if in personal workspace", async () => {
      // create a dummy user with some org and non-org settings
      let dummyUserNew = clonedeep(global.dummyUser);
      dummyUserNew.config.settings = {};
      dummyUserNew.config.settings = clonedeep(global.dummyGlobalSettings);
      await loginNewUser(dummyUserNew);

      // dummyGlobalSettings has a few settings which are org settings and some non org
      // settings as well.
      // Verifying if settingsToRender contains both types of keys
      expect("player" in wrapper.vm.settingsToRender).toBeTruthy();
      expect("app" in wrapper.vm.settingsToRender).toBeTruthy();
    });

    it("hides org settings from the menu if user does not have access to a setting", async () => {
      // create a dummy user with some org and non-org settings
      let dummyUserNew = clonedeep(global.dummyUser);
      dummyUserNew.config.settings = {};
      dummyUserNew.config.settings = clonedeep(global.dummyGlobalSettings);
      dummyUserNew.organizations[0].config = {
        settings: global.dummyGlobalSettingsFilteredForOrgs,
      };
      dummyUserNew.organizations[0].role = "org-view";
      dummyUserNew.organizations[1].config = {
        settings: global.dummyGlobalSettingsFilteredForOrgs,
      };
      dummyUserNew.organizations[1].role = "org-admin";
      await loginNewUser(dummyUserNew);

      // change the workspace to an org workspace
      await store.dispatch("auth/setActiveWorkspace", "o1");

      // the user does not have the correct role to view o1's settings
      // the player header requires someone with 'org-admin' or 'super-admin' roles to view
      expect("player" in wrapper.vm.settingsToRender).not.toBeTruthy();
      // but nevertheless the header exists in the org settings and user settings
      expect("player" in wrapper.vm.userSettings).toBeTruthy();
      expect("player" in wrapper.vm.activeWorkspaceSettings).toBeTruthy();

      // switching the workspace to o2
      await store.dispatch("auth/setActiveWorkspace", "o2");

      // the user does have the correct role to view o2's settings
      expect("player" in wrapper.vm.settingsToRender).toBeTruthy();
      // the header also exists in the org settings and user settings
      expect("player" in wrapper.vm.userSettings).toBeTruthy();
      expect("player" in wrapper.vm.activeWorkspaceSettings).toBeTruthy();
    });

    it("re-constructs settings menu if the user's object is updated", async () => {
      // currently, the headers available in the settings menu are 'app' and 'player'
      expect("app" in wrapper.vm.settingsToRender).toBeTruthy();
      expect("player" in wrapper.vm.settingsToRender).toBeTruthy();

      // switching the workspace to o2
      await store.dispatch("auth/setActiveWorkspace", "o2");

      // the user cannot access `player` key in o2 because it requires admin access
      // but the user has org-view access
      expect("player" in wrapper.vm.settingsToRender).toBeFalsy();

      // updating the user's role for o2 to org-admin
      let user = clonedeep(store.state.auth.user);
      user.organizations[1].role = "org-admin";
      await store.dispatch("auth/setUser", user);

      // the user should now be able to access `player` key in o2
      expect("player" in wrapper.vm.settingsToRender).toBeTruthy();
    });

    it("watches and updates the user's settings", async () => {
      // set global default settings as user's settings
      // await store.dispatch("auth/setUserSettings", global.dummyGlobalSettings);
      // await store.dispatch("sync/stopLoading");

      let dummyUserNew = clonedeep(global.dummyUser);
      dummyUserNew.config.settings = {};
      dummyUserNew.config.settings = clonedeep(global.dummyGlobalSettings);
      await loginNewUser(dummyUserNew);

      // show the settings menu
      await wrapper.setData({
        isSettingsMenuShown: true,
      });

      let updateUserSettingsAPI = jest.spyOn(
        UserAPIService,
        "updateUserSettings"
      );

      // before changing any setting, the value of a setting should match with what was set
      expect(
        wrapper.vm.settingsToRender.player.configuration.skipEnabled.value
      ).toEqual(
        global.dummyGlobalSettings.player.children.configuration.children
          .skipEnabled.value
      );
      // find the settings component, click one of the setting values and click save
      let settingsComponent = wrapper.findComponent(Settings);
      await settingsComponent
        .find('[data-test="setting-input"]')
        .trigger("click");
      await settingsComponent.find('[data-test="saveButton"]').trigger("click");
      // the settings component should emit the updated settings
      expect(settingsComponent.emitted()).toHaveProperty("update:settings");
      // the setting should be updated through an API call
      expect(updateUserSettingsAPI).toHaveBeenCalled();
      // the setting should've been updated in settingsToRender as well
      expect(wrapper.vm.settingsToRender).not.toStrictEqual(
        global.dummyGlobalSettings
      );
    });
  });

  describe("sidebar buttons", () => {
    let mockWindowOpen;
    beforeEach(async () => {
      mockWindowOpen = jest.fn().mockImplementation(() => ({
        focus: jest.fn(),
      }));
      Object.defineProperty(window, "open", {
        writable: true,
        value: mockWindowOpen,
      });
      await store.dispatch("sync/stopLoading");
    });

    afterEach(() => {
      // required otherwise the calls to window.open get stacked
      mockWindowOpen.mockRestore();
    });

    it("clicking on plio for teams redirects to teams page", async () => {
      await wrapper.find('[data-test="teams"]').trigger("click");
      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://docs.plio.in/plio-for-teams/",
        "_blank",
        "noopener"
      );
    });

    it("clicking on documentation redirects to docs page", async () => {
      await wrapper.find('[data-test="docs"]').trigger("click");
      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://docs.plio.in/",
        "_blank",
        "noopener"
      );
    });

    it("clicking on whats new redirects to blog page", async () => {
      await wrapper.find('[data-test="whatsNew"]').trigger("click");
      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://plio.substack.com/",
        "_blank",
        "noopener"
      );
    });

    it("clicking on product guides redirects to youtube playlist", async () => {
      await wrapper.find('[data-test="productGuides"]').trigger("click");
      expect(mockWindowOpen).toHaveBeenCalledWith(
        "https://www.youtube.com/playlist?list=PL3U0Jqw-piJgw2hSpuAZym4K1_Tb0RTRV",
        "_blank",
        "noopener"
      );
    });
  });
});
