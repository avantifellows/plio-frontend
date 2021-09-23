import { mount, flushPromises } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";
import store from "@/store";
import { setMatchMedia } from "@/services/Testing/Utilities";
import mockAxios from "jest-mock-axios";

describe("PlioListItem.vue", () => {
  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    setMatchMedia(false);
  });

  afterEach(() => {
    // cleaning up the mess left behind by the previous test
    mockAxios.reset();
  });

  it("should render with default values", () => {
    const wrapper = mount(PlioListItem);
    expect(wrapper).toBeTruthy();
  });

  it("should load plio given plio id", () => {
    const loadPlio = jest.spyOn(PlioListItem.methods, "loadPlio");
    mount(PlioListItem, {
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
    const wrapper = mount(PlioListItem, {
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
    const wrapper = mount(PlioListItem, {
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
    const wrapper = mount(PlioListItem, {
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

  it("sets whether the current screen is mobile screen based on window width", async () => {
    const plioDetails = {
      updatedAt: new Date(2018, 12, 31),
      status: "published",
    };

    const wrapper = mount(PlioListItem, {
      props: {
        plioId: "123",
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });

    // the default screen size should be classified as false
    expect(wrapper.vm.isMobileScreen).toBeFalsy();

    // update the value of the window width
    await wrapper.setData({
      windowWidth: 500,
    });

    // now the screen size should be classified as true
    expect(wrapper.vm.isMobileScreen).toBeTruthy();
  });

  it("play disabled for draft plio ", async () => {
    const wrapper = mount(PlioListItem, {
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
        .findAll('[data-test="option"]')[1]
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
      push: jest.fn(),
    };

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the play button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[1]
      .trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith({
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

    const wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the duplicate button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[4]
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

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the edit button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[0]
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
    const wrapper = mount(PlioListItem, {
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
        .findAll('[data-test="option"]')[2]
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

    const wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the share button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[2]
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

    const wrapper = mount(PlioListItem, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          plioDetails: plioDetails,
        };
      },
    });
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the embed button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[3]
      .trigger("click");

    expect(embedPlio).toHaveBeenCalled();
  });

  it("clicking dropdown shows action buttons", async () => {
    const wrapper = mount(PlioListItem, {
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
        .findAll('[data-test="option"]').length
    ).toBe(6);
  });

  it("analyze button should show up for touch device ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    const wrapper = mount(PlioListItem);

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // there should be 7 buttons - edit, play, share, embed, duplicate, delete, analyse
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .findAll('[data-test="option"]').length
    ).toBe(7);
  });

  it("analyze disabled for draft plio ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    const wrapper = mount(PlioListItem, {
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
        .findAll('[data-test="option"]')[3]
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

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the analyse button
    wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[4]
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
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // there should be no dialog box
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[5]
      .trigger("click");

    // there should be a dialog box now
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();
  });

  it("choosing no after clicking on delete closes the dialog box", async () => {
    const plioId = "123";
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
    await store.dispatch("sync/stopLoading");

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[5]
      .trigger("click");

    // click the cancel button of the dialog box
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="cancelButton"]')
      .trigger("click");

    // there should be no dialog box now
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();
  });

  it("choosing yes after clicking on delete triggers deletion", async () => {
    const plioId = "123";
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    // spy on the enableBackground and disableBackground methods
    const disableBackground = jest.spyOn(
      PlioListItem.methods,
      "disableBackground"
    );
    const enableBackground = jest.spyOn(
      PlioListItem.methods,
      "enableBackground"
    );

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
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
      .findAll('[data-test="option"]')[5]
      .trigger("click");

    // click the confirm button of the dialog box
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

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
    // there should be no dialog box now
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();
    // check emit
    expect(wrapper.emitted()).toHaveProperty("deleted");
  });

  it("error in deletion closes dialog box", async () => {
    const plioId = "123";
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    const enableBackground = jest.spyOn(
      PlioListItem.methods,
      "enableBackground"
    );

    const wrapper = mount(PlioListItem, {
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
    // passing in plioID triggers startLoading which keeps the component in pending state
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
      .findAll('[data-test="option"]')[5]
      .trigger("click");

    // click the confirm button of the dialog box
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    // mock the response to the request
    mockAxios.mockError();

    await flushPromises();

    // background should be enabled
    expect(enableBackground).toHaveBeenCalled();
    // there should be no dialog box now
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeFalsy();
  });

  it("delete confirmation dialog box margin is set correctly ", async () => {
    // margin value changes based on window width
    const wrapper = mount(PlioListItem, {
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

    // click the delete button
    await wrapper
      .get('[data-test="optionDropdown"]')
      .findAll('[data-test="option"]')[5]
      .trigger("click");

    // there should be no style attribute by default
    expect(wrapper.get('[data-test="dialogBox"]').attributes()).not.toContain(
      "style"
    );

    // screen size < 420 but > 400
    await wrapper.setData({
      windowWidth: 410,
    });
    expect(wrapper.get('[data-test="dialogBox"]').attributes("style")).toEqual(
      "left: 20%;"
    );

    // screen size < 400 but > 340
    await wrapper.setData({
      windowWidth: 350,
    });
    expect(wrapper.get('[data-test="dialogBox"]').attributes("style")).toEqual(
      "left: 15%;"
    );

    // screen size < 340
    await wrapper.setData({
      windowWidth: 320,
    });
    expect(wrapper.get('[data-test="dialogBox"]').attributes("style")).toEqual(
      "left: 10%;"
    );
  });
});
