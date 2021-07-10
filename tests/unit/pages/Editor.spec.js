import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";
import {
  dummyPlio,
  dummyItems,
  imageData,
} from "@/services/Testing/DummyData.js";

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

  it("play button works correctly", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    const plioId = "123";
    const redirectToPlayer = jest.spyOn(Editor.methods, "redirectToPlayer");
    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
    expect(
      wrapper.find('[data-test="playPlioButton"]').element.disabled
    ).toBeTruthy();

    await wrapper.setData({ status: "published" });
    expect(
      wrapper.find('[data-test="playPlioButton"]').element.disabled
    ).toBeFalsy();

    await wrapper.find('[data-test="playPlioButton"]').trigger("click");
    expect(redirectToPlayer).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Player",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("maximize modal functions correctly", async () => {
    const maximizeModal = jest.spyOn(Editor.methods, "maximizeModal");
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: dummyItems.data,
      currentItemIndex: 1,
      isModalMinimized: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper.find('[data-test="maximizeButton"]').trigger("click");
    expect(maximizeModal).toHaveBeenCalled();
    expect(wrapper.vm.isModalMinimized).toBe(false);
  });

  it("checks that no question time is smaller than minimum question timestamp", async () => {
    const wrapper = mount(Editor, { shallow: true });
    // defined in Editor.vue, cannot access the variable from there,
    // hence harcoding here
    const MINIMUM_QUESTION_TIMESTAMP = 0.6;

    // set some valid items and select the first item
    await wrapper.setData({
      items: dummyItems.data,
      currentItemIndex: 0,
    });

    // the correct timestamp value should be populated in itemTimestamps
    expect(wrapper.vm.itemTimestamps[0]).toBe(dummyItems.data[0].time);

    // update items with an invalid time value -> will call itemTimestamps watcher
    // the invalid time value should be fixed back to `MINIMUM_QUESTION_TIMESTAMP`
    let updatedDummyItems = dummyItems.data;
    updatedDummyItems[0].time = 0.1;
    await wrapper.setData({ items: updatedDummyItems });

    expect(wrapper.vm.items[0].time).toBe(MINIMUM_QUESTION_TIMESTAMP);
  });

  it("handles title updation correctly", async () => {
    const checkAndSavePlio = jest.spyOn(Editor.methods, "checkAndSavePlio");
    const wrapper = mount(Editor);

    await wrapper.setData({ plioTitle: "title for plio" });
    expect(wrapper.vm.loadedPlioDetails.plioTitle).not.toBe(
      wrapper.vm.plioTitle
    );
    expect(checkAndSavePlio).toHaveBeenCalled();
  });

  it("computes the itemImage property correctly", async () => {
    const wrapper = mount(Editor);

    await wrapper.setData({
      items: dummyItems.data,
      currentItemIndex: 0,
    });

    expect(wrapper.vm.itemImage).toBe(null);

    const imageURL = "test url";
    const dummyItemsWithImage = dummyItems.data;
    dummyItemsWithImage[0].details.image = {
      id: 56,
      url: imageURL,
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      items: dummyItemsWithImage,
    });

    expect(wrapper.vm.itemImage).toBe(imageURL);
  });

  it("computes itemType correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      currentItemIndex: 0,
      items: dummyItems.data,
    });
    expect(wrapper.vm.itemType).toBe(null);
    await wrapper.setData({
      isItemSelected: true,
    });
    expect(wrapper.vm.itemType).toBe(dummyItems.data[0].type);
  });

  it("computes correctOptionInex correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: dummyItems.data,
      currentItemIndex: 0,
    });
    expect(wrapper.vm.correctOptionIndex).toBe(
      dummyItems.data[0].details.correct_answer
    );
  });

  it("renders publish button tooltip correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      status: "published",
      hasUnpublishedChanges: true,
    });
    expect(wrapper.vm.publishButtonTooltip).toBe(
      "Click to publish your changes"
    );
    expect(
      wrapper.find('[data-test="publishButton"]').element.$_ptooltipValue
    ).toBe("Click to publish your changes");
  });

  it("shows dialog correctly when publish button is clicked", async () => {
    const wrapper = mount(Editor);

    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(wrapper.vm.publishDialogTitle).toBe(
      "Are you sure you want to publish the plio?"
    );
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to publish the plio?"
    );
    expect(wrapper.vm.publishDialogDescription).toBe(
      "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question"
    );
    expect(wrapper.vm.dialogDescription).toBe(
      "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question"
    );
    expect(wrapper.vm.dialogConfirmButtonConfig).toStrictEqual({
      enabled: true,
      text: "Yes",
      class:
        "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
    });
    expect(wrapper.vm.dialogCancelButtonConfig).toStrictEqual({
      enabled: true,
      text: "No",
      class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
    });
    expect(wrapper.vm.dialogAction).toBe("publish");
    expect(wrapper.vm.showDialogBox).toBeTruthy();

    await wrapper.setData({ status: "published" });
    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(wrapper.vm.publishDialogTitle).toBe(
      "Are you sure you want to publish your changes?"
    );
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to publish your changes?"
    );
    expect(wrapper.vm.publishDialogDescription).toBe(
      "The plio will be permananently changed once you publish the changes"
    );
    expect(wrapper.vm.dialogDescription).toBe(
      "The plio will be permananently changed once you publish the changes"
    );
  });

  it("dialog box buttons work correctly", async () => {
    const confirmPublish = jest.spyOn(Editor.methods, "confirmPublish");
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const publishButtonClicked = jest.spyOn(
      Editor.methods,
      "publishButtonClicked"
    );
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const wrapper = mount(Editor);

    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(publishButtonClicked).toHaveBeenCalled();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(wrapper.vm.dialogDescription).toBe("");
    expect(confirmPublish).toHaveBeenCalled();
    expect(wrapper.vm.dialogAction).toBe("");
    expect(wrapper.vm.showDialogBox).toBeTruthy();
    expect(wrapper.vm.dialogTitle).toBe("Publishing the plio...");
    expect(wrapper.vm.publishInProgressDialogTitle).toBe(
      "Publishing the changes.."
    );
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeFalsy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe("");
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeFalsy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe("");
    expect(publishPlio).toHaveBeenCalled();
  });

  it("share plio button inside the share dialog works correctly", async () => {
    const hidePublishedDialogShowShareDialog = jest.spyOn(
      Editor.methods,
      "hidePublishedDialogShowShareDialog"
    );
    const showSharePlioLinkDialog = jest.spyOn(
      Editor.methods,
      "showSharePlioLinkDialog"
    );
    const showSharePlioDialog = jest.spyOn(
      Editor.methods,
      "showSharePlioDialog"
    );
    jest.spyOn(Editor.methods, "savePlio").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock player
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const wrapper = mount(Editor, {
      shallow: true,
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
    });
    await wrapper.setData({
      showPublishedPlioDialog: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper.find('[data-test="dialogShareButton"]').trigger("click");
    expect(hidePublishedDialogShowShareDialog).toHaveBeenCalled();
    expect(wrapper.vm.showPublishedPlioDialog).toBeFalsy();
    expect(showSharePlioLinkDialog).toHaveBeenCalled();
    expect(showSharePlioDialog).toHaveBeenCalled();
  });

  it("closes the published plio dialog properly", async () => {
    const closePublishedPlioDialog = jest.spyOn(
      Editor.methods,
      "closePublishedPlioDialog"
    );
    const wrapper = mount(Editor);
    await wrapper.setData({
      showPublishedPlioDialog: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper
      .find('[data-test="closePublishedPlioDialogButton"]')
      .trigger("click");
    expect(closePublishedPlioDialog).toHaveBeenCalled();
    expect(wrapper.vm.showPublishedPlioDialog).toBeFalsy();
  });

  it("redirects to dashboard when analyse button is clicked", async () => {
    const redirectToDashboard = jest.spyOn(
      Editor.methods,
      "redirectToDashboard"
    );
    const mockRouter = { push: jest.fn() };
    const wrapper = mount(Editor, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
    await wrapper.setData({
      status: "published",
    });
    await wrapper.find('[data-test="analyseButton"]').trigger("click");
    expect(redirectToDashboard).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Dashboard",
      params: {
        org: "",
        plioId: "",
      },
    });
  });

  it("deletes linked image properly", async () => {
    const deleteLinkedImage = jest.spyOn(Editor.methods, "deleteLinkedImage");
    const wrapper = mount(Editor);

    const dummyItemsWithImage = dummyItems.data;
    dummyItemsWithImage[0].details.image = {
      id: 56,
      url: "https://plio-prod-assets.s3.amazonaws.com/images/hxojrjdasf.png",
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      showImageUploaderDialog: true,
      items: dummyItemsWithImage,
      itemImage: dummyItemsWithImage[0].details.image.url,
      currentItemIndex: 0,
    });

    await wrapper
      .find('[data-test="imageUploaderDialog"]')
      .find('[data-test="deleteImageButton"]')
      .trigger("click");
    expect(deleteLinkedImage).toHaveBeenCalled();
  });

  it("uploads image properly via ImageUploaderDialog", async () => {
    mockAxios.reset();
    const uploadImage = jest.spyOn(Editor.methods, "uploadImage");
    const submitImage = jest.spyOn(ImageUploaderDialog.methods, "submitImage");
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: dummyItems.data,
      showImageUploaderDialog: true,
      currentItemIndex: 0,
    });

    let imageUploaderWrapper = wrapper.findComponent(ImageUploaderDialog);
    imageUploaderWrapper.setData({
      localImageData: imageData,
    });

    await imageUploaderWrapper
      .find('[data-test="submitImageButton"]')
      .trigger("click");

    expect(submitImage).toHaveBeenCalled();
    expect(uploadImage).toHaveBeenCalled();

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(
      `/images/`,
      mockAxios.lastReqGet().data
    );

    mockAxios.mockResponse(
      {
        data: "mock response",
      },
      mockAxios.lastReqGet()
    );

    await flushPromises();
    expect(wrapper.vm.items[0].details.image).toBe("mock response");
  });
});
