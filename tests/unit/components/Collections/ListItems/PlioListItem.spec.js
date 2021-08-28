import { mount } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";
import store from "@/store";
import { setMatchMedia } from "@/services/Testing/Utilities";

describe("PlioListItem.vue", () => {
  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    setMatchMedia(false);
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

  it("clicking dropdown shows action buttons", async () => {
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

    // there should be 4 buttons - edit, play, share, duplicate
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .findAll('[data-test="option"]').length
    ).toBe(4);
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
      .findAll('[data-test="option"]')[3]
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

  it("clicking share shows the share dialog ", async () => {
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

  it("analyze button should show up for touch device ", async () => {
    // set `matches` as `True` for testing on touch screen devices
    setMatchMedia(true);

    const wrapper = mount(PlioListItem);

    // click the option dropdown
    await wrapper
      .get('[data-test="optionDropdown"]')
      .get('[data-test="toggleButton"]')
      .trigger("click");

    // there should be 5 buttons - edit, play, share, duplicate, analyse
    expect(
      wrapper
        .get('[data-test="optionDropdown"]')
        .findAll('[data-test="option"]').length
    ).toBe(5);
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
      .findAll('[data-test="option"]')[3]
      .trigger("click");

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Dashboard",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });
});
