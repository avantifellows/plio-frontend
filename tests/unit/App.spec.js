import { mount, flushPromises } from "@vue/test-utils";
import UserAPIService from "@/services/API/User.js";
import router from "@/router";
import store from "@/store";
import App from "@/App";

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
          resolve({ data: dummyUser });
        });
      });

    // set user
    await store.dispatch("auth/setAccessToken", dummyAccessToken);

    router.push("/home");

    wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    // After this line, router is ready
    await router.isReady();
  });

  it("should render", async () => {
    expect(wrapper.vm.isAuthenticated).toBeTruthy();
  });

  it("shows dialog box when dialog box is set to be shown", async () => {
    // dialog box shouldn't be shown at first
    expect(wrapper.vm.isDialogBoxShown).toBeFalsy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();

    // set the dialog box to be shown and its properties
    await store.dispatch("dialog/setDialogTitle", dialogTitle);
    await store.dispatch("dialog/setDialogDescription", dialogDescription);
    await store.dispatch("dialog/setConfirmButtonConfig", confirmButtonConfig);
    await store.dispatch("dialog/setCancelButtonConfig", cancelButtonConfig);
    await store.dispatch("dialog/setDialogBox");

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
      await store.dispatch("dialog/setDialogBox");
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
});
