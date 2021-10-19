import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import Plio from "@/pages/Embeds/Plio.vue";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import InputText from "@/components/UI/Text/InputText.vue";
import {
  dummyDraftPlio,
  dummyItems,
  dummyVideo,
  imageData,
  dummyItemDetails,
  dummyPublishedPlio,
} from "@/services/Testing/DummyData.js";
import store from "@/store";

var clonedeep = require("lodash.clonedeep");

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
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

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

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
    const showPublishConfirmationDialogBox = jest.spyOn(
      Editor.methods,
      "showPublishConfirmationDialogBox"
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
    expect(showPublishConfirmationDialogBox).toHaveBeenCalled();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(wrapper.vm.dialogDescription).toBe("");
    expect(confirmPublish).toHaveBeenCalled();
    expect(wrapper.vm.dialogAction).toBe("");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
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

  it("shows only the video preview + video input field when video ID is not set", async () => {
    const wrapper = mount(Editor);

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

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

  it("shows published + home + preview buttons when video ID is added", async () => {
    const wrapper = mount(Editor, {
      shallow: true,
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // things that should not be visible
    expect(wrapper.find('[data-test="sharePlioButton]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="embedPlioButton]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="analyseButton]').exists()).toBeFalsy();

    // things that should be visible
    expect(
      wrapper.find('[data-test="plioPreviewButton"]').exists()
    ).toBeTruthy();
    expect(wrapper.find('[data-test="homeButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="publishButton"]').exists()).toBeTruthy();
  });

  it("share + play + embed buttons appear on publishing", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    const wrapper = mount(Editor, {
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
      data() {
        const confetti = require("canvas-confetti");
        // have to create it manually as jest creates a DIV instead of CANVAS on it's own
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.setAttribute("id", "sharePlioConfettiCanvas");
        const confettiHandler = confetti.create(confettiCanvas, {
          resize: true,
        });
        return {
          videoId: "jdYJf_ybyVo",
          items: clonedeep(dummyItems),
          itemDetails: clonedeep(dummyItemDetails),
          currentItemIndex: 0,
          confettiHandler: confettiHandler,
        };
      },
    });

    // share and play plio buttons should not be visible when video ID is set
    expect(wrapper.find('[data-test="sharePlioButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeFalsy();
    expect(wrapper.find('[data-test="embedPlioButton"]').exists()).toBeFalsy();

    // click on the publish button
    await wrapper.find('[data-test="publishButton"]').trigger("click");
    // confirm that you want to publish
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    await flushPromises();

    // share, play and embed plio buttons should be visible when video ID is set
    expect(wrapper.find('[data-test="sharePlioButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="embedPlioButton"]').exists()).toBeTruthy();
  });

  it("blurs the main screen when dialog box is shown", async () => {
    const wrapper = mount(Editor, { shallow: true });
    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // blur classes should not be present initially
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    await wrapper.setData({ isDialogBoxShown: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("blurs the main screen when image uploader dialog is shown", async () => {
    const wrapper = mount(Editor, { shallow: true });
    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // blur classes should not be present initially
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    await wrapper.setData({ isImageUploaderDialogShown: true });
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
  });

  it("blurs the main screen and show dialog when published plio dialog is shown", async () => {
    const wrapper = mount(Editor, { shallow: true });
    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // blur classes should not be present initially
    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.not.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    // published dialog should not be shown initially
    expect(wrapper.find('[data-test="publishedDialog"]').exists()).toBeFalsy();

    await wrapper.setData({ isPublishedPlioDialogShown: true });

    expect(wrapper.get('[data-test="blurDiv"]').classes()).toEqual(
      expect.arrayContaining(["opacity-30", "pointer-events-none"])
    );
    expect(wrapper.find('[data-test="publishedDialog"]').exists()).toBeTruthy();
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

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // use `wrapper.vm.__` to access the updated data variables inside the component
    expect(wrapper.vm.loadedPlioDetails.items).toStrictEqual(dummyItems);
    expect(wrapper.vm.loadedPlioDetails.itemDetails).toStrictEqual(
      dummyItemDetails
    );
    expect(wrapper.vm.items).toStrictEqual(dummyItems);
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

  it("saves changes when items are changed", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");

    const wrapper = mount(Editor, {
      props: {
        plioId: "123",
      },
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
      data() {
        return {
          items: clonedeep(dummyItems),
          itemDetails: clonedeep(dummyItemDetails),
          videoId: "jdYJf_ybyVo",
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();

    // items not changed, method not called at first
    expect(saveChanges).not.toHaveBeenCalled();

    // update time of one of the items
    let updatedItems = clonedeep(dummyItems);
    updatedItems[0].time += 10;
    wrapper.vm.items[0].time += 10;
    await flushPromises();

    expect(saveChanges).toHaveBeenCalledWith(
      "item",
      dummyItems[0].id,
      updatedItems[0]
    );
  });

  it("saves changes when item details are changed", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");

    const wrapper = mount(Editor, {
      shallow: true,
      props: {
        plioId: "123",
      },
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
      data() {
        return {
          items: clonedeep(dummyItems),
          itemDetails: clonedeep(dummyItemDetails),
          videoId: "jdYJf_ybyVo",
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();
    await store.dispatch("sync/stopLoading");

    // items not changed, method not called at first
    expect(saveChanges).not.toHaveBeenCalled();

    // update the text of one of the itemDetails
    const newQuestionText = "text";
    let updatedItemDetails = clonedeep(dummyItemDetails);
    updatedItemDetails[0].text = newQuestionText;
    wrapper.vm.itemDetails[0].text = updatedItemDetails[0].text;
    await flushPromises();
    expect(saveChanges).toHaveBeenCalledWith(
      "question",
      dummyItemDetails[0].id,
      updatedItemDetails[0]
    );
  });

  it("creates video and links to plio when a valid video link is entered", async () => {
    const checkAndSaveChanges = jest.spyOn(
      Editor.methods,
      "checkAndSaveChanges"
    );
    const plioId = "1234";
    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

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

    const videoURL = "https://www.youtube.com/watch?v=jdYJf_ybyVo";
    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue(videoURL);

    expect(wrapper.vm.videoId).toBe("jdYJf_ybyVo");
    expect(checkAndSaveChanges).toHaveBeenCalled();
    expect(wrapper.vm.isVideoIdValid).toBeTruthy();
    expect(
      wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="validationMessage"]')
        .exists()
    ).toBeFalsy();

    expect(mockAxios.post).toHaveBeenCalledTimes(1);
    expect(mockAxios.post).toHaveBeenCalledWith(`/videos/`, {
      url: videoURL,
      duration: 0,
    });

    mockAxios.mockResponse(
      {
        data: dummyVideo,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    expect(mockAxios.patch).toHaveBeenCalledWith(`/plios/${plioId}`, {
      video: dummyVideo.id,
    });
  });

  it("updates video when a new valid URL is updated", async () => {
    const checkAndSaveChanges = jest.spyOn(
      Editor.methods,
      "checkAndSaveChanges"
    );
    const initialVideoId = "jdYJf_ybyVo";
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: initialVideoId,
          videoDBId: dummyVideo.id,
        };
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue("invalid video url");

    // since an invalid url was given, the video Id should remain the same
    expect(wrapper.vm.videoId).toBe(initialVideoId);

    const newVideoURL = "https://www.youtube.com/watch?v=abcdefghijk";
    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue(newVideoURL);

    expect(wrapper.vm.videoId).toBe("abcdefghijk");
    expect(checkAndSaveChanges).toHaveBeenCalledWith("video", dummyVideo.id, {
      duration: 0,
      url: newVideoURL,
    });

    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    expect(mockAxios.patch).toHaveBeenCalledWith(`/videos/${dummyVideo.id}`, {
      url: newVideoURL,
      duration: 0,
    });
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
      resolve: jest.fn(() => {
        return {
          href: "test",
        };
      }),
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

    await wrapper.find('[data-test="playPlioButton"]').trigger("click");
    expect(redirectToPlayer).toHaveBeenCalled();
    expect(mockRouter.resolve).toHaveBeenCalledWith({
      name: "Player",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("clicking preview button shows plio preview", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());
    const togglePlioPreviewMode = jest.spyOn(
      Editor.methods,
      "togglePlioPreviewMode"
    );
    const setPlioPreviewLoaded = jest.spyOn(
      Editor.methods,
      "setPlioPreviewLoaded"
    );
    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

    /**
     * the component would be in the uploading state
     * this would reset it
     */
    await store.dispatch("sync/stopUploading");

    // preview should not be shown by default
    expect(wrapper.vm.isPlioPreviewShown).toBeFalsy();
    expect(wrapper.vm.isPlioPreviewLoaded).toBeFalsy();

    await wrapper.find('[data-test="plioPreviewButton"]').trigger("click");
    expect(togglePlioPreviewMode).toHaveBeenCalled();
    expect(wrapper.vm.isPlioPreviewShown).toBeTruthy();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    let plioResponse = clonedeep(dummyDraftPlio);

    mockAxios.mockResponse(plioResponse, mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    expect(setPlioPreviewLoaded).toHaveBeenCalled();
    expect(wrapper.vm.isPlioPreviewLoaded).toBeTruthy();
  });

  it("clicking on the close button of preview closes the preview", async () => {
    const plioId = "123";
    jest
      .spyOn(Plio.methods, "setPlayerAspectRatio")
      .mockImplementation(() => jest.fn());
    const closePlioPreview = jest.spyOn(Editor.methods, "closePlioPreview");

    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);

    // wait until the DOM updates after promises resolve
    await flushPromises();

    await wrapper.find('[data-test="plioPreviewButton"]').trigger("click");

    // resolve the getPlio method within Plio.vue with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();

    await wrapper.find('[data-test="closePlioPreviewButton"]').trigger("click");

    expect(closePlioPreview).toHaveBeenCalled();
    expect(wrapper.vm.isPlioPreviewShown).toBeFalsy();
    expect(wrapper.vm.isPlioPreviewLoaded).toBeFalsy();
  });

  it("home button works correctly", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    const returnToHome = jest.spyOn(Editor.methods, "returnToHome");
    const wrapper = mount(Editor, {
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

    await wrapper.find('[data-test="homeButton"]').trigger("click");
    expect(returnToHome).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Home",
      params: {
        org: "",
      },
    });
  });

  it("checks that no question time is smaller than minimum question timestamp", async () => {
    const wrapper = mount(Editor, { shallow: true });
    // defined in Editor.vue, cannot access the variable from there,
    // hence harcoding here
    const MINIMUM_QUESTION_TIMESTAMP = 0.6;

    // set items, currentItemIndex and itemDetails
    await wrapper.setData({
      items: clonedeep(dummyItems),
      currentItemIndex: 0,
      itemDetails: dummyItemDetails,
    });

    // resolve the loadPlio method call with dummy plio details
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();

    // without any change, the time value of the first item should be the same as
    // originally provided
    expect(wrapper.vm.items[0].time).toBe(dummyItems[0].time);

    // giving the first item an invalid time value
    wrapper.vm.items[0].time = 0.1;
    await flushPromises();
    // will call itemTimestamps watcher
    // the invalid time value should be fixed back to `MINIMUM_QUESTION_TIMESTAMP`
    expect(wrapper.vm.items[0].time).toBe(MINIMUM_QUESTION_TIMESTAMP);
  });

  it("handles title updation correctly", async () => {
    const checkAndSaveChanges = jest.spyOn(
      Editor.methods,
      "checkAndSaveChanges"
    );
    const wrapper = mount(Editor);

    await wrapper.setData({ plioTitle: "title for plio" });
    expect(wrapper.vm.loadedPlioDetails.plioTitle).not.toBe(
      wrapper.vm.plioTitle
    );
    expect(checkAndSaveChanges).toHaveBeenCalled();
  });

  it("computes the itemImage property correctly", async () => {
    const wrapper = mount(Editor);

    const imageURL = "test url";
    const dummyItemDetailsWithImage = clonedeep(dummyItemDetails);
    dummyItemDetailsWithImage[0].image = {
      id: 56,
      url: imageURL,
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetailsWithImage),
      currentItemIndex: 0,
    });

    expect(wrapper.vm.itemImage).toBe(imageURL);
  });

  it("computes itemType correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      currentItemIndex: 0,
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
    });
    expect(wrapper.vm.itemType).toBe(null);
    await wrapper.setData({
      isItemSelected: true,
    });
    expect(wrapper.vm.itemType).toBe(dummyItems[0].type);
  });

  it("computes correctOptionInex correctly", async () => {
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
      currentItemIndex: 0,
    });
    expect(wrapper.vm.correctOptionIndex).toBe(
      dummyItemDetails[0].correct_answer
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

  it("shows published dialog when publish is confirmed", async () => {
    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");
    const updateVideo = jest.spyOn(Editor.methods, "updateVideo");
    const updatePlio = jest.spyOn(Editor.methods, "updatePlio");
    const updateItem = jest.spyOn(Editor.methods, "updateItem");
    const updateQuestionDetails = jest.spyOn(
      Editor.methods,
      "updateQuestionDetails"
    );
    const dialogConfirmed = jest.spyOn(Editor.methods, "dialogConfirmed");
    const confirmPublish = jest.spyOn(Editor.methods, "confirmPublish");
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const wrapper = mount(Editor, {
      data() {
        const confetti = require("canvas-confetti");
        // have to create it manually as jest creates a DIV instead of CANVAS on it's own
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.setAttribute("id", "sharePlioConfettiCanvas");
        const confettiHandler = confetti.create(confettiCanvas, {
          resize: true,
        });
        return {
          videoId: "abcdefgh",
          videoDBId: dummyVideo.id,
          confettiHandler: confettiHandler,
          items: clonedeep(dummyItems),
          itemDetails: clonedeep(dummyItemDetails),
        };
      },
      props: {
        plioId: String(dummyPublishedPlio.data.id),
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to publish the plio?"
    );
    expect(wrapper.vm.dialogDescription).toBe(
      "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question. You can also preview the plio before publishing it."
    );
    expect(wrapper.vm.dialogConfirmButtonConfig).toStrictEqual({
      enabled: true,
      text: "Publish",
      class:
        "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
    });
    expect(wrapper.vm.dialogCancelButtonConfig).toStrictEqual({
      enabled: true,
      text: "Preview",
      class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
    });
    expect(wrapper.vm.dialogAction).toBe("publish");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();

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
    expect(wrapper.vm.dialogConfirmButtonConfig).toStrictEqual({
      enabled: true,
      text: "Yes",
      class:
        "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
    });
    expect(wrapper.vm.dialogCancelButtonConfig).toStrictEqual({
      enabled: true,
      text: "No",
      class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
    });

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(confirmPublish).toHaveBeenCalled();
    expect(publishPlio).toHaveBeenCalled();
    expect(wrapper.vm.status).toBe("published");
    expect(saveChanges).toHaveBeenCalledWith("all");

    // video update check
    expect(updateVideo).toHaveBeenCalled();

    // mock video response
    mockAxios.mockResponse(
      {
        data: dummyVideo,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    // 1 call to /items and /questions for each item and 1 call to /plio
    expect(mockAxios.queue().length).toBe(dummyItems.length * 2 + 1);
    expect(updateItem).toHaveBeenCalledTimes(4);

    // mock responses to requests for /items
    mockAxios.mockResponse(
      {
        data: dummyItems[0],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItems[1],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItems[2],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItems[3],
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    expect(updateQuestionDetails).toHaveBeenCalledTimes(4);

    // mock responses to requests for /questions
    mockAxios.mockResponse(
      {
        data: dummyItemDetails[0],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItemDetails[1],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItemDetails[2],
      },
      mockAxios.queue()[0]
    );
    mockAxios.mockResponse(
      {
        data: dummyItemDetails[3],
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    expect(updatePlio).toHaveBeenCalled();
  });

  it("clicking on preview button of publish confirmation dialog shows plio preview", async () => {
    const dialogCancelled = jest.spyOn(Editor.methods, "dialogCancelled");
    const togglePlioPreviewMode = jest.spyOn(
      Editor.methods,
      "togglePlioPreviewMode"
    );
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });
    await wrapper.find('[data-test="publishButton"]').trigger("click");

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="cancelButton"]')
      .trigger("click");

    expect(dialogCancelled).toHaveBeenCalled();
    expect(togglePlioPreviewMode).toHaveBeenCalled();
  });

  it("clicking on cancel button of publish confirmation dialog for published plio closes dialog", async () => {
    const dialogCancelled = jest.spyOn(Editor.methods, "dialogCancelled");
    const togglePlioPreviewMode = jest.spyOn(
      Editor.methods,
      "togglePlioPreviewMode"
    );
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
          status: "published",
        };
      },
    });
    await wrapper.find('[data-test="publishButton"]').trigger("click");

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="cancelButton"]')
      .trigger("click");

    expect(dialogCancelled).toHaveBeenCalled();
    expect(togglePlioPreviewMode).not.toHaveBeenCalled();
  });

  it("play plio button inside the published dialog works correctly", async () => {
    // mock router
    const mockRouter = {
      resolve: jest.fn(() => {
        return {
          href: "test",
        };
      }),
    };
    const plioId = "123";
    const redirectToPlayer = jest.spyOn(Editor.methods, "redirectToPlayer");

    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock player as player.pause() will be invoked
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const wrapper = mount(Editor, {
      shallow: true,
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          player: mockPlayer,
          $router: mockRouter,
        },
      },
    });
    await wrapper.setData({
      isPublishedPlioDialogShown: true,
      videoId: "jdYJf_ybyVo",
      status: "published",
    });

    await wrapper
      .find('[data-test="publishedDialogPlayButton"]')
      .trigger("click");

    expect(redirectToPlayer).toHaveBeenCalled();
    expect(mockRouter.resolve).toHaveBeenCalledWith({
      name: "Player",
      params: {
        org: "",
        plioId: plioId,
      },
    });
  });

  it("embed plio button inside the published dialog works correctly", async () => {
    const plioId = "123";

    const hidePublishedDialogShowEmbedDialog = jest.spyOn(
      Editor.methods,
      "hidePublishedDialogShowEmbedDialog"
    );
    const showEmbedPlioDialog = jest.spyOn(
      Editor.methods,
      "showEmbedPlioDialog"
    );

    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock player as player.pause() will be invoked
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const wrapper = mount(Editor, {
      shallow: true,
      props: {
        plioId: plioId,
      },
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
    });
    await wrapper.setData({
      isPublishedPlioDialogShown: true,
      videoId: "jdYJf_ybyVo",
      status: "published",
    });

    await wrapper
      .find('[data-test="publishedDialogEmbedButton"]')
      .trigger("click");

    expect(hidePublishedDialogShowEmbedDialog).toHaveBeenCalled();
    expect(wrapper.vm.isPublishedPlioDialogShown).toBeFalsy();
    expect(showEmbedPlioDialog).toHaveBeenCalled();

    // reset the status of the embed plio variable
    await store.dispatch("generic/unsetEmbedPlioDialog");
  });

  it("clicking on embed shows dialog with embed code and blurs screen", async () => {
    const plioId = "123";
    const showEmbedPlioDialog = jest.spyOn(
      Editor.methods,
      "showEmbedPlioDialog"
    );
    const wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
        };
      },
    });
    await store.dispatch("sync/stopLoading");

    // embed dialog variable should be false initially and the background
    // should not be disabled
    expect(wrapper.vm.isEmbedPlioDialogShown).toBeFalsy();
    expect(wrapper.vm.isBackgroundDisabled).toBeFalsy();

    await wrapper.setData({ status: "published" });

    await wrapper.find('[data-test="embedPlioButton"]').trigger("click");
    expect(showEmbedPlioDialog).toHaveBeenCalled();

    // embed dialog variable should be now true and the background
    // should be disabled
    expect(wrapper.vm.isEmbedPlioDialogShown).toBeTruthy();
    expect(wrapper.vm.isBackgroundDisabled).toBeTruthy();
  });

  it("home button inside the published dialog works correctly", async () => {
    // mock router
    const mockRouter = {
      push: jest.fn(),
    };
    const returnToHome = jest.spyOn(Editor.methods, "returnToHome");

    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock player as player.pause() will be invoked
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const wrapper = mount(Editor, {
      shallow: true,
      global: {
        mocks: {
          player: mockPlayer,
          $router: mockRouter,
        },
      },
    });
    await wrapper.setData({
      isPublishedPlioDialogShown: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper
      .find('[data-test="publishedDialogHomeButton"]')
      .trigger("click");

    expect(returnToHome).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: "Home",
      params: {
        org: "",
      },
    });
  });

  it("share plio button inside the published dialog works correctly", async () => {
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
    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    // mock player as player.pause() will be invoked
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
      isPublishedPlioDialogShown: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper
      .find('[data-test="publishedDialogShareButton"]')
      .trigger("click");
    expect(hidePublishedDialogShowShareDialog).toHaveBeenCalled();
    expect(wrapper.vm.isPublishedPlioDialogShown).toBeFalsy();
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
      isPublishedPlioDialogShown: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper
      .find('[data-test="closePublishedPlioDialogButton"]')
      .trigger("click");
    expect(closePublishedPlioDialog).toHaveBeenCalled();
    expect(wrapper.vm.isPublishedPlioDialogShown).toBeFalsy();
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

    const dummyItemDetailsWithImage = clonedeep(dummyItemDetails);
    dummyItemDetailsWithImage[0].image = {
      id: 56,
      url: "https://plio-prod-assets.s3.amazonaws.com/images/hxojrjdasf.png",
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      isImageUploaderDialogShown: true,
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetailsWithImage),
      itemImage: clonedeep(dummyItemDetailsWithImage[0].image.url),
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
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
      isImageUploaderDialogShown: true,
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

    const mockImageResponse = {
      key: "value",
    };
    mockAxios.mockResponse(
      {
        data: mockImageResponse,
      },
      mockAxios.lastReqGet()
    );

    await flushPromises();
    expect(wrapper.vm.itemDetails[0].image).toStrictEqual(mockImageResponse);
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
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
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
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.optionIndexToDelete).toBe(0);
    expect(wrapper.vm.dialogAction).toBe("deleteOption");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
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
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeFalsy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe("");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");

    let updatedDummyItemDetails = clonedeep(dummyItemDetails);
    updatedDummyItemDetails[0].options.push("option 3");
    await wrapper.setData({
      items: clonedeep(dummyItems),
      itemDetails: updatedDummyItemDetails,
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
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.optionIndexToDelete).toBe(0);
    expect(wrapper.vm.dialogAction).toBe("deleteOption");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(confirmDeleteOption).toHaveBeenCalled();
    expect(wrapper.vm.optionIndexToDelete).toBe(-1);
    expect(wrapper.vm.itemDetails[0].options.length).toBe(2);
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
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      currentTimestamp: 15.6,
    });

    // resolve the loadPlio method call with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();

    // trying to add an item where another item already exists is not possible
    // this will show an error dialog
    await wrapper.find('[data-test="addMCQItem"]').trigger("click");
    expect(addNewItem).toHaveBeenCalled();
    expect(showCannotAddItemDialog).toHaveBeenCalled();
    expect(wrapper.vm.pending).toBeFalsy();

    await wrapper.setData({
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
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
    const itemEditorDeleteSelectedItem = jest.spyOn(
      ItemEditor.methods,
      "deleteSelectedItem"
    );
    const showDeleteItemDialogBox = jest.spyOn(
      Editor.methods,
      "showDeleteItemDialogBox"
    );
    const clearItemAndItemDetailWatcher = jest.spyOn(
      Editor.methods,
      "clearItemAndItemDetailWatcher"
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
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
      itemType: "question",
    });

    // resolve the loadPlio method call with a dummy plio
    mockAxios.mockResponse(clonedeep(dummyDraftPlio), mockAxios.queue()[0]);
    await flushPromises();

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);

    await itemEditorWrapper.find('[data-test="deleteItem"]').trigger("click");

    expect(itemEditorDeleteSelectedItem).toHaveBeenCalled();
    expect(itemEditorWrapper.emitted()).toHaveProperty("delete-selected-item");
    expect(showDeleteItemDialogBox).toHaveBeenCalled();
    expect(wrapper.vm.dialogTitle).toBe(
      "Are you sure you want to delete this?"
    );
    expect(wrapper.vm.dialogDescription).toBe(
      "This will permanently delete this question"
    );
    expect(wrapper.vm.dialogConfirmButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogConfirmButtonConfig.text).toBe("Yes");
    expect(wrapper.vm.dialogConfirmButtonConfig.class).toBe(
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(wrapper.vm.dialogCancelButtonConfig.enabled).toBeTruthy();
    expect(wrapper.vm.dialogCancelButtonConfig.text).toBe("No");
    expect(wrapper.vm.dialogCancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.dialogAction).toBe("deleteItem");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
    expect(wrapper.find('[data-test="dialogBox"]').exists()).toBeTruthy();

    expect(wrapper.vm.itemUnwatchers[dummyItems[0].id]).toBeTruthy();

    await wrapper
      .find('[data-test="dialogBox"]')
      .find('[data-test="confirmButton"]')
      .trigger("click");
    expect(dialogConfirmed).toHaveBeenCalled();
    expect(editorDeleteSelectedItem).toHaveBeenCalled();
    expect(clearItemAndItemDetailWatcher).toHaveBeenCalled();
    expect(wrapper.vm.itemUnwatchers[dummyItems[0].id]).toBe(undefined);
    expect(wrapper.vm.itemDetailUnwatchers[dummyItems[0].id]).toBe(undefined);
    expect(wrapper.vm.items.length).toBeLessThan(dummyItems.length);
  });

  it("updating plio title calls saveChanges with resource as plio", async () => {
    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");
    const plioId = String(dummyPublishedPlio.data.id);
    const wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
          plioTitle: dummyPublishedPlio.data.title,
        };
      },
      props: {
        plioId: plioId,
      },
    });

    // update the title
    const newTitle = "new title";
    wrapper.vm.plioTitle = newTitle;

    // wait for the DOM to update and the watcher to have been called
    await flushPromises();

    expect(saveChanges).toHaveBeenCalledWith("plio", plioId, {
      name: newTitle,
    });
  });

  it("minimizes modal correctly", async () => {
    const minimizeModal = jest.spyOn(Editor.methods, "minimizeModal");
    const wrapper = mount(Editor);

    await wrapper.setData({
      isModalMinimized: false,
      isItemSelected: true,
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
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

  it("maximize modal functions correctly", async () => {
    const maximizeModal = jest.spyOn(Editor.methods, "maximizeModal");
    const wrapper = mount(Editor);
    await wrapper.setData({
      items: clonedeep(dummyItems),
      itemDetails: clonedeep(dummyItemDetails),
      currentItemIndex: 1,
      isItemSelected: true,
      isModalMinimized: true,
      videoId: "jdYJf_ybyVo",
    });

    await wrapper.find('[data-test="maximizeButton"]').trigger("click");
    expect(maximizeModal).toHaveBeenCalled();
    expect(wrapper.vm.isModalMinimized).toBe(false);
  });
});
