import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import InputText from "@/components/UI/Text/InputText.vue";
import {
  dummyDraftPlio,
  dummyItems,
  imageData,
} from "@/services/Testing/DummyData.js";
import store from "@/store";

var cloneDeep = require("lodash.clonedeep");

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

  it("dialog box buttons work correctly", async () => {
    const confirmPublish = jest.spyOn(Editor.methods, "confirmPublish");
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const publishButtonClicked = jest.spyOn(
      Editor.methods,
      "publishButtonClicked"
    );
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const wrapper = mount(Editor, {
      shallow: false,
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });

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

  it("shows only the video preview + video input field when video ID is not set", () => {
    const wrapper = mount(Editor, { shallow: true });

    // things that should not be visible
    expect(wrapper.find('[data-test="itemDiv"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="plioName"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="lowerButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="upperButtons"]').exists()).toBeFalsy();

    // things that should be visible
    expect(wrapper.find('[data-test="videoLinkInput"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="videoLinkInfo"]').exists()).toBeTruthy();
    expect(
      wrapper.find('[data-test="videoPreviewSkeleton"]').exists()
    ).toBeTruthy();
  });

  it("share + play buttons appear on publishing", async () => {
    const wrapper = mount(Editor);

    await wrapper.setData({
      videoId: "abcdefgh",
    });

    // share and play plio buttons should not be visible when video ID is set
    expect(wrapper.find('[data-test="sharePlioButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeFalsy();

    // click on the publish button
    await wrapper.find('[data-test="publishButton"]').trigger("click");
    // confirm that you want to publish
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    await flushPromises();

    // share and play plio buttons should not be visible when video ID is set
    expect(wrapper.find('[data-test="sharePlioButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeTruthy();
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
    // 1 `GET` request is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);

    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    let plioResponse = dummyDraftPlio;

    // resolve the `GET` request waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(plioResponse, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // use `wrapper.vm.__` to access the updated data variables inside the component
    expect(wrapper.vm.loadedPlioDetails.items).toStrictEqual(
      dummyDraftPlio.data.items
    );
    expect(wrapper.vm.items).toStrictEqual(dummyDraftPlio.data.items);
    expect(wrapper.vm.videoURL).toEqual(dummyDraftPlio.data.video.url);
    expect(wrapper.vm.plioTitle).toEqual(dummyDraftPlio.data.name);
    expect(wrapper.vm.status).toEqual(dummyDraftPlio.data.status);
    expect(wrapper.vm.lastUpdated).toEqual(
      new Date(dummyDraftPlio.data.updated_at)
    );
    expect(wrapper.vm.hasUnpublishedChanges).toBeFalsy();
    expect(wrapper.vm.videoDBId).toEqual(dummyDraftPlio.data.video.id);
    expect(wrapper.vm.plioDBId).toEqual(dummyDraftPlio.data.id);
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
    await wrapper.setData({ items: dummyDraftPlio.data.items });
    expect(checkAndSavePlio).toHaveBeenCalled();

    // update the items, method should've been called
    let updatedDummyItems = cloneDeep(dummyDraftPlio.data.items);
    updatedDummyItems.time = 20;
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
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

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
      items: dummyDraftPlio.data.items,
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

    // update items with an invalid time value -> will call itemTimestamps watcher
    // the invalid time value should be fixed back to `MINIMUM_QUESTION_TIMESTAMP`
    let updatedDummyItems = cloneDeep(dummyDraftPlio.data.items);
    updatedDummyItems[0].time = 0.1;
    await wrapper.setData({ items: updatedDummyItems, currentItemIndex: 0 });

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

    const imageURL = "test url";
    const dummyItemsWithImage = cloneDeep(dummyDraftPlio.data.items);
    dummyItemsWithImage[0].details.image = {
      id: 56,
      url: imageURL,
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      items: dummyItemsWithImage,
      currentItemIndex: 0,
    });

    expect(wrapper.vm.itemImage).toBe(imageURL);
  });

  it("computes itemType correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      currentItemIndex: 0,
      items: dummyDraftPlio.data.items,
    });
    expect(wrapper.vm.itemType).toBe(null);
    await wrapper.setData({
      isItemSelected: true,
    });
    expect(wrapper.vm.itemType).toBe(dummyDraftPlio.data.items[0].type);
  });

  it("computes correctOptionInex correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: dummyDraftPlio.data.items,
      currentItemIndex: 0,
    });
    expect(wrapper.vm.correctOptionIndex).toBe(
      dummyDraftPlio.data.items[0].details.correct_answer
    );
  });

  it("renders publish button tooltip correctly", async () => {
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });
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
    const savePlio = jest
      .spyOn(Editor.methods, "savePlio")
      .mockImplementation(() => {
        return new Promise((resolve) => resolve());
      });
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const confirmPublish = jest.spyOn(Editor.methods, "confirmPublish");
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });

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

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(confirmPublish).toHaveBeenCalled();
    expect(publishPlio).toHaveBeenCalled();
    expect(wrapper.vm.status).toBe("published");
    expect(savePlio).toHaveBeenCalled();

    await flushPromises();
    expect(wrapper.vm.isBeingPublished).toBeFalsy();
    expect(wrapper.vm.showDialogBox).toBeFalsy();
    expect(wrapper.vm.showPublishedPlioDialog).toBeTruthy();
    expect(wrapper.vm.hasUnpublishedChanges).toBeFalsy();
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
      data() {
        return {
          videoId: "abcdefgh",
        };
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

    const dummyItemsWithImage = cloneDeep(dummyDraftPlio.data.items);
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
      items: dummyDraftPlio.data.items,
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

  it("delete option functionality works correctly", async () => {
    const endIconSelected = jest.spyOn(InputText.methods, "endIconSelected");
    const itemEditorDeleteOption = jest.spyOn(
      ItemEditor.methods,
      "deleteOption"
    );
    const editorDeleteOption = jest.spyOn(Editor.methods, "deleteOption");
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const confirmDeleteOption = jest.spyOn(
      Editor.methods,
      "confirmDeleteOption"
    );
    const showCannotDeleteOptionDialog = jest.spyOn(
      Editor.methods,
      "showCannotDeleteOptionDialog"
    );
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });
    await wrapper.setData({
      items: dummyDraftPlio.data.items,
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");

    expect(endIconSelected).toHaveBeenCalled();
    expect(inputTextWrapper.emitted()).toHaveProperty("end-icon-selected");

    expect(itemEditorDeleteOption).toHaveBeenCalled();
    expect(itemEditorWrapper.emitted()).toHaveProperty("delete-option");

    expect(editorDeleteOption).toHaveBeenCalled();
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to delete this option?"
    );
    expect(wrapper.vm.dialogDescription).toBe("");
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("Yes");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe(
      "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.optionIndexToDelete).toBe(0);
    expect(wrapper.vm.dialogAction).toBe("deleteOption");
    expect(wrapper.vm.showDialogBox).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(confirmDeleteOption).toHaveBeenCalled();
    expect(showCannotDeleteOptionDialog).toHaveBeenCalled();

    expect(wrapper.vm.dialogTitle).toBe("Cannot delete the option");
    expect(wrapper.vm.dialogDescription).toBe(
      "A question must have at least 2 options"
    );
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("Got it");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe(
      "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeFalsy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe("");
    expect(wrapper.vm.showDialogBox).toBeTruthy();
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    let updatedDummyItems = cloneDeep(dummyDraftPlio.data.items);
    updatedDummyItems[0].details.options.push("option 3");
    await wrapper.setData({
      items: updatedDummyItems,
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");

    expect(endIconSelected).toHaveBeenCalled();
    expect(inputTextWrapper.emitted()).toHaveProperty("end-icon-selected");

    expect(itemEditorDeleteOption).toHaveBeenCalled();
    expect(itemEditorWrapper.emitted()).toHaveProperty("delete-option");

    expect(editorDeleteOption).toHaveBeenCalled();
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to delete this option?"
    );
    expect(wrapper.vm.dialogDescription).toBe("");
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("Yes");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe(
      "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.optionIndexToDelete).toBe(0);
    expect(wrapper.vm.dialogAction).toBe("deleteOption");
    expect(wrapper.vm.showDialogBox).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(confirmDeleteOption).toHaveBeenCalled();
    expect(wrapper.vm.optionIndexToDelete).toBe(-1);
    expect(wrapper.vm.items[0].details.options.length).toBe(2);
  });

  it("add new item functionality works correctly", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };
    const addNewItem = jest.spyOn(Editor.methods, "addNewItem");
    const showCannotAddItemDialog = jest.spyOn(
      Editor.methods,
      "showCannotAddItemDialog"
    );
    const getDetailsForNewQuestion = jest.spyOn(
      Editor.methods,
      "getDetailsForNewQuestion"
    );
    const markItemSelected = jest.spyOn(Editor.methods, "markItemSelected");
    const wrapper = mount(Editor, {
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
    });
    await wrapper.setData({
      items: dummyDraftPlio.data.items,
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      currentTimestamp: 15.6,
    });
    await store.dispatch("sync/stopLoading");

    // trying to add an item where another item already exists is not possible
    // this will show an error dialog
    await wrapper.find('[data-test="addMCQItem"]').trigger("click");
    expect(addNewItem).toHaveBeenCalled();
    expect(showCannotAddItemDialog).toHaveBeenCalled();
    expect(wrapper.vm.pending).toBeFalsy();

    await wrapper.setData({
      items: dummyItems.data,
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      currentTimestamp: 12,
      plioDBId: 13,
    });
    await store.dispatch("sync/stopLoading");

    // the item will be added now because the timestamp is not clashing
    // with the timestamp of another item
    await wrapper.find('[data-test="addMCQItem"]').trigger("click");
    expect(addNewItem).toHaveBeenCalled();

    expect(mockAxios.post).toHaveBeenCalledWith("/items/", {
      plio: 13,
      type: "question",
      time: 12,
      meta: { source: { name: "default" } },
    });
    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    let createdItemResponse = {
      data: {
        id: 212,
        plio: 13,
        type: "question",
        time: 12,
        meta: {
          source: {
            name: "default",
          },
        },
        created_at: "2021-07-10T22:50:55.102379Z",
        updated_at: "2021-07-10T22:50:55.102466Z",
      },
    };

    // resolve the two `GET` requests waiting in the queue
    // using the fake response data
    mockAxios.mockResponse(createdItemResponse, mockAxios.lastReqGet());
    await flushPromises();
    expect(getDetailsForNewQuestion).toHaveBeenCalled();

    expect(mockAxios.post).toHaveBeenCalledWith("/questions/", {
      correct_answer: 0,
      text: "",
      type: "mcq",
      options: ["", ""],
      max_char_limit: 100,
      item: createdItemResponse.data.id,
    });

    let createdQuestionResponse = {
      data: {
        id: 212,
        item: 212,
        text: "",
        type: "mcq",
        options: ["", ""],
        correct_answer: "0",
        image: null,
        has_char_limit: false,
        max_char_limit: 100,
        created_at: "2021-07-10T22:50:55.280135Z",
        updated_at: "2021-07-10T22:50:55.280210Z",
      },
    };

    mockAxios.mockResponse(createdQuestionResponse, mockAxios.lastReqGet());
    await flushPromises();

    expect(markItemSelected).toHaveBeenCalled();
    expect(wrapper.vm.pending).toBeFalsy();
  });

  it("delete item functionality works correctly", async () => {
    const deleteSelectedItem = jest.spyOn(
      ItemEditor.methods,
      "deleteSelectedItem"
    );
    const deleteItemButtonClicked = jest.spyOn(
      Editor.methods,
      "deleteItemButtonClicked"
    );
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const editorDeleteSelectedItem = jest.spyOn(
      Editor.methods,
      "deleteSelectedItem"
    );
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });
    await wrapper.setData({
      items: cloneDeep(dummyDraftPlio.data.items),
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
      itemType: "question",
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);

    await itemEditorWrapper.find('[data-test="deleteItem"]').trigger("click");

    expect(deleteSelectedItem).toHaveBeenCalled();
    expect(itemEditorWrapper.emitted()).toHaveProperty("delete-selected-item");
    expect(deleteItemButtonClicked).toHaveBeenCalled();
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to delete this?"
    );
    expect(wrapper.vm.dialogDescription).toBe(
      "This will permanently delete this question"
    );
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("Yes");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe(
      "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.dialogAction).toBe("deleteItem");
    expect(wrapper.vm.showDialogBox).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(editorDeleteSelectedItem).toHaveBeenCalled();
    expect(wrapper.vm.items.length).toBeLessThan(
      dummyDraftPlio.data.items.length
    );
  });

  it("minimizes modal correctly", async () => {
    const minimizeModal = jest.spyOn(Editor.methods, "minimizeModal");
    const wrapper = mount(Editor);

    await wrapper.setData({
      isModalMinimized: false,
      items: dummyDraftPlio.data.items,
      currentItemIndex: 0,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper
      .find('[data-test="itemModal"]')
      .find('[data-test="header"]')
      .find('[data-test="minimize"]')
      .trigger("click");
    expect(minimizeModal).toHaveBeenCalled();
  });
});
