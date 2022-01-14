import { mount, flushPromises } from "@vue/test-utils";
import UserAPIService from "@/services/API/User.js";
import router from "@/router";
import store from "@/store";
import App from "@/App";
import Settings from "@/components/Collections/Settings/Settings.vue";

import mockAxios from "jest-mock-axios";
let clonedeep = require("lodash.clonedeep");

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

  it("watches and updates the user's settings", async () => {
    jest.restoreAllMocks();
    // set global default settings as user's settings
    await store.dispatch("auth/setUserSettings", global.dummyGlobalSettings);
    await store.dispatch("sync/stopLoading");
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
