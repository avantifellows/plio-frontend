import { mount, flushPromises } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";
import store from "@/store";
import { setMatchMedia } from "@/services/Testing/Utilities";
import mockAxios from "jest-mock-axios";

describe("PlioListItem.vue", () => {
  let wrapper;

  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    setMatchMedia(false);
  });

  afterEach(() => {
    // cleaning up the mess left behind by the previous test
    mockAxios.reset();
    wrapper.unmount();
  });

  it("should render with default values", () => {
    wrapper = mount(PlioListItem);
    expect(wrapper).toBeTruthy();
  });

  it("should load plio given plio id", () => {
    const loadPlio = jest.spyOn(PlioListItem.methods, "loadPlio");
    wrapper = mount(PlioListItem, {
      props: {
        plioId: "test",
      },
    });
    expect(loadPlio).toHaveBeenCalled();
  });

  it("load variables given plio details are fetched", () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "draft",
      plioTitle: "testTitle",
    };
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    expect(wrapper.vm.updatedAt).toBe(
      plioDetails.updatedAt.toDateString().slice(4)
    );
    expect(wrapper.vm.status).toBe(plioDetails.status);
    expect(wrapper.vm.title).toBe(plioDetails.plioTitle);
    expect(wrapper.vm.statusBadge).toBe("Draft");
  });

  it("uses placeholder title when no plio title is given", () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "draft",
    };
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    expect(wrapper.vm.title).toBe("Untitled");
  });

  it("sets isPublished based on status correctly", async () => {
    var plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "draft",
    };
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    expect(wrapper.vm.isPublished).toBe(false);
    plioDetails.status = "published";

    await wrapper.setData({
      plioDetails: plioDetails,
    });
    expect(wrapper.vm.isPublished).toBe(true);
  });

  it("sets whether the current screen is tab screen based on window width", async () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };

    wrapper = mount(PlioListItem, {
      props: {
        plioId: "123",
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });

    // set the value of the window width
    store.dispatch("generic/setWindowInnerWidth", window.innerWidth);

    // the default screen size should be classified as false
    expect(wrapper.vm.isTabScreen).toBeFalsy();

    // update the value of the window width
    store.dispatch("generic/setWindowInnerWidth", 500);

    // now the screen size should be classified as true
    expect(wrapper.vm.isTabScreen).toBeTruthy();
  });

  it("play disabled for draft plio ", async () => {
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "draft",
          },
        };
      },
    });
    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cursor not allowed - when play button is disabled
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .find('[data-test="option-play"]')
        .classes()
    ).toContain("cursor-not-allowed");
  });

  it("clicking play redirects to player for published plio ", async () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };
    const plioId = "123";
    // mock router
    const mockRouter = {
      resolve: jest.fn(() => {
        return {
          href: "test",
        };
      }),
    };

    wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the play button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-play"]')
      .trigger("click");

    expect(mockRouter.resolve).toHaveBeenCalledWith({
      name: "Player",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("clicking duplicate triggers duplicate function ", async () => {
    const duplicatePlio = jest.spyOn(PlioListItem.methods, "duplicatePlio");
    const duplicateThenRoute = jest.spyOn(
      PlioListItem.methods,
      "duplicateThenRoute"
    );
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };
    const plioId = "123";

    wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the duplicate button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-duplicate"]')
      .trigger("click");

    expect(duplicatePlio).toHaveBeenCalled();
    expect(duplicateThenRoute).toHaveBeenCalled();
  });

  it("clicking edit redirects to editor for the plio ", async () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };
    const plioId = "123";
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the edit button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-edit"]')
      .trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Editor",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("share disabled for draft plio ", async () => {
    // needed as buttons are not present by default for screen width < 420
    jest.spyOn(screen, "availWidth", "get").mockReturnValue(500);
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "draft",
          },
        };
      },
    });

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cursor not allowed - when share button is disabled
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .find('[data-test="option-share"]')
        .classes()
    ).toContain("cursor-not-allowed");
  });

  it("clicking share shows the share dialog", async () => {
    const sharePlio = jest.spyOn(PlioListItem.methods, "sharePlio");

    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };
    const plioId = "123";

    wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the share button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-share"]')
      .trigger("click");

    expect(sharePlio).toHaveBeenCalled();
  });

  it("clicking embed shows the embed dialog ", async () => {
    const embedPlio = jest.spyOn(PlioListItem.methods, "embedPlio");

    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };
    const plioId = "123";

    wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the embed button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-embed"]')
      .trigger("click");

    expect(embedPlio).toHaveBeenCalled();
  });

  it("clicking dropdown shows action buttons", async () => {
    wrapper = mount(PlioListItem, {
      props: {
        plioId: "123",
      },
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
    });

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // there should be 6 buttons - edit, play, share, embed, duplicate, delete
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .find('[data-test="options"]')
        .findAll("li").length
    ).toBe(6);
  });

  it("analyze button should show up for touch device ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    wrapper = mount(PlioListItem);

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // there should be 7 buttons - edit, play, share, embed, duplicate, delete, analyse
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .find('[data-test="options"]')
        .findAll("li").length
    ).toBe(7);
  });

  it("analyze disabled for draft plio ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "draft",
          },
        };
      },
    });

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cursor not allowed - when analyse button is disabled
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .find('[data-test="option-analyse"]')
        .classes()
    ).toContain("cursor-not-allowed");
  });

  it("clicking analyze routes to Dashboard ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    const plioId = "123";
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the analyse button
    wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-analyse"]')
      .trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Dashboard",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("clicking on delete launches a dialog box", async () => {
    const plioId = "123";
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // there should be no dialog box
    expect(wrapper.vm.isDialogBoxShown).toBeFalsy();

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // there should be a dialog box now
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
  });

  it("choosing no after clicking on delete closes the dialog box", async () => {
    const plioId = "123";
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // simulate clicking the cancel button of the dialog box
    await store.dispatch("dialog/unsetDialogBox");
    await store.dispatch("dialog/setCancelClicked");

    // dialog cancel button state should have been reset
    expect(wrapper.vm.isDialogCancelClicked).toBeFalsy();
    // dialog action should be unset
    expect(wrapper.vm.dialogAction).toBeFalsy();
  });

  it("choosing yes after clicking on delete triggers deletion", async () => {
    const plioId = "123";
    // spy on the enableBackground and disableBackground methods
    const disableBackground = jest.spyOn(
      PlioListItem.methods,
      "disableBackground"
    );
    const enableBackground = jest.spyOn(
      PlioListItem.methods,
      "enableBackground"
    );

    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cleanup past requests
    mockAxios.reset();

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // simulate clicking the confirm button of the dialog box
    await store.dispatch("dialog/unsetDialogBox");
    await store.dispatch("dialog/setConfirmClicked");

    // `deletePlio` inside services/API/Plio.js should've been called
    expect(mockAxios.delete).toHaveBeenCalled();
    expect(mockAxios.delete).toHaveBeenCalledWith(`/plios/${plioId}`);

    // background should be disabled
    expect(disableBackground).toHaveBeenCalled();

    // mock the response to the request
    mockAxios.mockResponse(
      {
        status: 204,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    // background should be enabled
    expect(enableBackground).toHaveBeenCalled();
    // dialog confirm button state should have been reset
    expect(wrapper.vm.isDialogConfirmClicked).toBeFalsy();
    // dialog action should be unset
    expect(wrapper.vm.dialogAction).toBeFalsy();
    // check emit
    expect(wrapper.emitted()).toHaveProperty("deleted");
  });

  it("error in deletion closes dialog box", async () => {
    const plioId = "123";
    const enableBackground = jest.spyOn(
      PlioListItem.methods,
      "enableBackground"
    );

    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cleanup past requests
    mockAxios.reset();

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // simulate clicking the confirm button of the dialog box
    await store.dispatch("dialog/unsetDialogBox");
    await store.dispatch("dialog/setConfirmClicked");

    // mock the response to the request
    mockAxios.mockError();

    await flushPromises();

    // background should be enabled
    expect(enableBackground).toHaveBeenCalled();
    // dialog confirm button state should have been reset
    expect(wrapper.vm.isDialogConfirmClicked).toBeFalsy();
    // dialog action should be unset
    expect(wrapper.vm.dialogAction).toBeFalsy();
  });

  it("does not interfere with irrelevant dialog confirm trigger", async () => {
    const plioId = "123";
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the
    // component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cleanup past requests
    mockAxios.reset();

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // change the dialog action so that it is no longer
    // relevant to this component
    const newDialogAction = "testAction";
    await store.dispatch("dialog/setDialogAction", newDialogAction);

    // set the dialog confirm button to have been clicked
    await store.dispatch("dialog/unsetDialogBox");
    await store.dispatch("dialog/setConfirmClicked");

    // the dialog action shouldn't have been affected and
    // the confirm click status should remain active
    expect(wrapper.vm.isDialogConfirmClicked).toBeTruthy();
    expect(wrapper.vm.dialogAction).toBe(newDialogAction);
  });

  it("does not interfere with irrelevant dialog cancel trigger", async () => {
    const plioId = "123";
    wrapper = mount(PlioListItem, {
      data() {
        return {
          plioDetails: {
            updatedAt: new Date(2018, 12, 31),
            status: "published",
          },
        };
      },
      props: {
        plioId: plioId,
      },
    });
    // passing in plioId triggers startLoading which keeps the
    // component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // cleanup past requests
    mockAxios.reset();

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .find('[data-test="option-delete"]')
      .trigger("click");

    // change the dialog action so that it is no longer
    // relevant to this component
    const newDialogAction = "testAction";
    await store.dispatch("dialog/setDialogAction", newDialogAction);

    // set the dialog cancel button to have been clicked
    await store.dispatch("dialog/unsetDialogBox");
    await store.dispatch("dialog/setCancelClicked");

    // the dialog action shouldn't have been affected and
    // the confirm click status should remain active
    expect(wrapper.vm.isDialogCancelClicked).toBeTruthy();
    expect(wrapper.vm.dialogAction).toBe(newDialogAction);
  });
});
