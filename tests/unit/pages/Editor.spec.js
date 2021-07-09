import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import { dummyPlio, dummyItems } from "@/services/Testing/DummyData.js";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Editor.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Editor);
    expect(wrapper).toBeTruthy();
  });

  it("blurs the main screen when plio is being published", async () => {
    const wrapper = mount(Editor);
    // blur classes should not be present initially
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    // setting `isBeingPublished` to true, that will blur the screen
    await wrapper.setData({ isBeingPublished: true });
    // blur classes should be present now
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("blurs the main screen when dialog box is shown", async () => {
    const wrapper = mount(Editor, { shallow: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    await wrapper.setData({ showDialogBox: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("blurs the main screen when image uploader dialog is shown", async () => {
    const wrapper = mount(Editor);
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    await wrapper.setData({ showImageUploaderDialog: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("blurs the main screen when published plio dialog is shown", async () => {
    const wrapper = mount(Editor);
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    await wrapper.setData({ showPublishedPlioDialog: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("loads a plio and populates local variables properly", async () => {
    let plioId = "mlungtvmyl";
    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
    });
    // `getPlio` inside services/API/Plio.js should've been called
    // 2 `GET` requests are made
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);
    expect(mockAxios.get).toHaveBeenCalledWith("/items/", {
      params: { plio: `${plioId}` },
    });

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    let plioResponse = dummyPlio;
    let itemResponse = dummyItems;

    // resolve the two `GET` requests waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(plioResponse, mockAxios.queue()[0]);
    mockAxios.mockResponse(itemResponse, mockAxios.queue()[1]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // use `wrapper.vm.__` to access the updated data variables inside the component
    expect(wrapper.vm.loadedPlioDetails.items).toStrictEqual(dummyItems.data);
    expect(wrapper.vm.items).toStrictEqual(dummyItems.data);
    expect(wrapper.vm.videoURL).toEqual(dummyPlio.data.video.url);
    expect(wrapper.vm.plioTitle).toEqual(dummyPlio.data.name);
    expect(wrapper.vm.status).toEqual(dummyPlio.data.status);
    expect(wrapper.vm.lastUpdated).toEqual(new Date(dummyPlio.data.updated_at));
    expect(wrapper.vm.hasUnpublishedChanges).toBeFalsy();
    expect(wrapper.vm.videoDBId).toEqual(dummyPlio.data.video.id);
    expect(wrapper.vm.plioDBId).toEqual(dummyPlio.data.id);
  });

  it("saves plio in regular intervals if there's a change", async () => {
    const savePlio = jest
      .spyOn(Editor.methods, "savePlio")
      .mockImplementation(() => {
        return;
      });
    jest.spyOn(Editor.methods, "loadPlio").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });
    const wrapper = mount(Editor);
    const timeInterval = wrapper.vm.saveInterval;

    // setInterval would've been called again after 5 seconds
    // but as `changeInProgress` is false, `savePlio` will not be called
    jest.advanceTimersByTime(timeInterval);
    expect(savePlio).not.toHaveBeenCalled();

    // change `changeInProgress` to true,
    // and check before & after 5 seconds
    await wrapper.setData({ changeInProgress: true });
    expect(savePlio).not.toHaveBeenCalled();
    jest.advanceTimersByTime(timeInterval);
    expect(savePlio).toHaveBeenCalled();
  });

  it("saves plio when items are changed", async () => {
    const checkAndSavePlio = jest.spyOn(Editor.methods, "checkAndSavePlio");
    const wrapper = mount(Editor);

    // items not changed, method not called at first
    expect(checkAndSavePlio).not.toHaveBeenCalled();

    // add items to the component, the method should've been called
    await wrapper.setData({ items: dummyItems.data });
    expect(checkAndSavePlio).toHaveBeenCalled();

    // update the items, method should've been called
    let updatedDummyItems = dummyItems.data;
    updatedDummyItems[0].time = 20;
    await wrapper.setData({ items: updatedDummyItems });
    expect(checkAndSavePlio).toHaveBeenCalled();
  });

  it("handles video link updation correctly", async () => {
    const checkAndSavePlio = jest.spyOn(Editor.methods, "checkAndSavePlio");
    const wrapper = mount(Editor);
    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue("invalid video url");

    expect(wrapper.vm.isVideoIdValid).toBeFalsy();
    expect(
      wrapper.find('[data-test="videoPreviewSkeleton"]').exists()
    ).toBeTruthy();
    expect(wrapper.find('[data-test="videoPreview"]').exists()).toBeFalsy();
    expect(
      wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="validationMessage"]')
        .text()
    ).toBe("Invalid Link");
    expect(
      wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="validationMessage"]')
        .classes()
    ).toContain("text-red-600");

    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue("https://www.youtube.com/watch?v=jdYJf_ybyVo");

    expect(wrapper.vm.videoId).toBe("jdYJf_ybyVo");
    expect(checkAndSavePlio).toHaveBeenCalled();
    expect(wrapper.vm.isVideoIdValid).toBeTruthy();
    expect(
      wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="validationMessage"]')
        .exists()
    ).toBeFalsy();
  });

  it("share plio button works correctly", async () => {
    const showSharePlioLinkDialog = jest.spyOn(
      Editor.methods,
      "showSharePlioLinkDialog"
    );
    const showSharePlioDialog = jest.spyOn(
      Editor.methods,
      "showSharePlioDialog"
    );
    const wrapper = mount(Editor, {
      global: {
        stubs: {
          DialogBox: {
            template: "<span />",
          },
        },
      },
    });
    await wrapper.setData({ videoId: "jdYJf_ybyVo" });

    expect(
      wrapper.find('[data-test="sharePlioButton"]').element.disabled
    ).toBeTruthy();
    expect(
      wrapper
        .find('[data-test="sharePlioButton"]')
        .find('[data-test="title"]')
        .text()
    ).toBe("Share");
    expect(
      wrapper
        .find('[data-test="sharePlioButton"]')
        .find('[data-test="title"]')
        .classes()
    ).toContain("text-yellow-800");
    expect(
      wrapper
        .find('[data-test="sharePlioButton"]')
        .find('[data-test="title"]')
        .classes()
    ).toContain("text-yellow-800");

    await wrapper.setData({ status: "published" });

    expect(
      wrapper.find('[data-test="sharePlioButton"]').element.disabled
    ).toBeFalsy();

    await wrapper.find('[data-test="sharePlioButton"]').trigger("click");
    expect(showSharePlioLinkDialog).toHaveBeenCalled();
    expect(showSharePlioDialog).toHaveBeenCalled();
  });
});
