import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import { dummyPlio, dummyItems } from "@/services/Testing/DummyData.js";

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
    let response1 = dummyPlio;
    let response2 = dummyItems;

    // resolve the two `GET` requests waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(response1, mockAxios.queue()[0]);
    mockAxios.mockResponse(response2, mockAxios.queue()[1]);

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
});
