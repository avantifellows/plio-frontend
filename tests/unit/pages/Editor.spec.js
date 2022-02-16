import { mount, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";

import Editor from "@/pages/Editor.vue";
import Plio from "@/pages/Embeds/Plio.vue";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog.vue";
import ItemEditor from "@/components/Editor/ItemEditor.vue";
import InputText from "@/components/UI/Text/InputText.vue";
import Settings from "@/components/App/Settings.vue";
import store from "@/store";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
import UserAPIService from "@/services/API/User.js";
import PlioAPIService from "@/services/API/Plio.js";

let clonedeep = require("lodash.clonedeep");
const videoDuration = 695;

describe("Editor.vue", () => {
  let wrapper;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // mocking this function so that it doesn't interfere with
    // tests that are not related to settings
    jest
      .spyOn(Editor.methods, "constructSettingsMenu")
      .mockImplementation(() => {
        return;
      });
  });

  afterEach(async () => {
    // cleaning up the mess left behind by the previous test
    mockAxios.reset();
    await store.dispatch("auth/setActiveWorkspace", "");
    if (wrapper != undefined) wrapper.unmount();
  });

  it("renders properly with default values", () => {
    wrapper = mount(Editor);
    expect(wrapper).toBeTruthy();
  });

  it("shows spinner when plio is being published", async () => {
    wrapper = mount(Editor);

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // spinner should not be present initially
    expect(wrapper.vm.isSpinnerShown).toBeFalsy();
    // setting `isBeingPublished` to true, that will blur the screen
    await wrapper.setData({ isBeingPublished: true });
    // spinner should be present now
    expect(wrapper.vm.isSpinnerShown).toBeTruthy();
  });

  it("dialog box buttons work correctly", async () => {
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const showPublishConfirmationDialogBox = jest.spyOn(
      Editor.methods,
      "showPublishConfirmationDialogBox"
    );
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });

    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(showPublishConfirmationDialogBox).toHaveBeenCalled();

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();
    await flushPromises();

    expect(publishPlio).toHaveBeenCalled();
  });

  it("shows only the video preview + video input field when video ID is not set", async () => {
    wrapper = mount(Editor);

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
    expect(wrapper.find('[data-test="previewSkeleton"]').exists()).toBeTruthy();
  });

  it("shows publish + home + preview buttons when video Id is valid", async () => {
    wrapper = mount(Editor, {
      shallow: true,
      data() {
        return {
          isVideoIdValid: true,
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

  it("also shows copy draft link button when video is valid for organization's workspace", async () => {
    wrapper = mount(Editor, {
      shallow: true,
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // set active workspace to 'test'
    await store.dispatch("auth/setActiveWorkspace", "test");

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
    expect(wrapper.find('[data-test="copyDraftButton"]').exists()).toBeTruthy();
  });

  it("clicking on copy draft link button copies draft link in organization's workspace", async () => {
    // mock document.execCommand
    document.execCommand = jest.fn();

    const plioId = "123";
    const activeWorkspace = "test";
    wrapper = mount(Editor, {
      shallow: true,
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
        };
      },
      props: {
        plioId: plioId,
        workspace: activeWorkspace,
      },
    });

    // editor goes into pending = true state upon loading
    // this resets pending to false
    await store.dispatch("sync/stopLoading");

    // set active workspace
    await store.dispatch("auth/setActiveWorkspace", activeWorkspace);

    await wrapper.find('[data-test="copyDraftButton"]').trigger("click");
    let draftLink = `${process.env.VUE_APP_FRONTEND}/${activeWorkspace}/edit/${plioId}`;
    draftLink = draftLink.replace("http://", "");
    draftLink = draftLink.replace("https://", "");
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(
      GenericUtilities.getPlioDraftLink(wrapper.vm.plioId, wrapper.vm.workspace)
    ).toBe(draftLink);
  });

  it("share + play + embed buttons appear on publishing", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    jest.spyOn(Editor.methods, "saveChanges").mockImplementation(() => {
      return new Promise((resolve) => resolve());
    });

    wrapper = mount(Editor, {
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
      data() {
        const confetti = require("canvas-confetti");
        // have to create it manually as jest creates a DIV instead of CANVAS on its own
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.setAttribute("id", "sharePlioConfettiCanvas");
        const confettiHandler = confetti.create(confettiCanvas, {
          resize: true,
        });
        return {
          videoId: "jdYJf_ybyVo",
          isVideoIdValid: true,
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
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

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    await flushPromises();

    // share, play and embed plio buttons should be visible when video ID is set
    expect(wrapper.find('[data-test="sharePlioButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="playPlioButton"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test="embedPlioButton"]').exists()).toBeTruthy();
  });

  it("blurs the main screen when image uploader dialog is shown", async () => {
    wrapper = mount(Editor, { shallow: true });
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
    wrapper = mount(Editor, { shallow: true });
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
    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
    });
    // `getPlio` inside services/API/Plio.js should've been called
    // 1 `GET` request is made
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // use `wrapper.vm.__` to access the updated data variables inside the component
    expect(wrapper.vm.loadedPlioDetails.items).toStrictEqual(global.dummyItems);
    expect(wrapper.vm.loadedPlioDetails.itemDetails).toStrictEqual(
      global.dummyItemDetails
    );
    expect(wrapper.vm.items).toStrictEqual(global.dummyItems);
    expect(wrapper.vm.videoURL).toEqual(global.dummyDraftPlio.data.video.url);
    expect(wrapper.vm.plioTitle).toEqual(global.dummyDraftPlio.data.name);
    expect(wrapper.vm.status).toEqual(global.dummyDraftPlio.data.status);
    expect(wrapper.vm.lastUpdated).toEqual(
      new Date(global.dummyDraftPlio.data.updated_at)
    );
    expect(wrapper.vm.hasUnpublishedChanges).toBeFalsy();
    expect(wrapper.vm.videoDBId).toEqual(global.dummyDraftPlio.data.video.id);
    expect(wrapper.vm.plioDBId).toEqual(global.dummyDraftPlio.data.id);
  });

  it("saves changes when items are changed", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");

    wrapper = mount(Editor, {
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
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
          videoId: "jdYJf_ybyVo",
          isVideoIdValid: true,
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
    await flushPromises();

    // items not changed, method not called at first
    expect(saveChanges).not.toHaveBeenCalled();

    // update time of one of the items
    let updatedItems = clonedeep(global.dummyItems);
    updatedItems[0].time += 10;
    wrapper.vm.items[0].time += 10;
    await flushPromises();

    expect(saveChanges).toHaveBeenCalledWith(
      "item",
      global.dummyItems[0].id,
      updatedItems[0]
    );
  });

  it("saves changes when item details are changed", async () => {
    const mockPlayer = {
      pause: jest.fn(),
      destroy: jest.fn(),
    };

    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");

    wrapper = mount(Editor, {
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
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
          videoId: "jdYJf_ybyVo",
          isVideoIdValid: true,
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
    await flushPromises();
    await store.dispatch("sync/stopLoading");

    // items not changed, method not called at first
    expect(saveChanges).not.toHaveBeenCalled();

    // update the text of one of the itemDetails
    const newQuestionText = "text";
    let updatedItemDetails = clonedeep(global.dummyItemDetails);
    updatedItemDetails[0].text = newQuestionText;
    wrapper.vm.itemDetails[0].text = updatedItemDetails[0].text;
    await flushPromises();
    expect(saveChanges).toHaveBeenCalledWith(
      "question",
      global.dummyItemDetails[0].id,
      updatedItemDetails[0]
    );
  });

  it("resets spinner if any error occured upon entering valid video link", async () => {
    const hideSpinner = jest.spyOn(Editor.methods, "hideSpinner");
    const plioId = "1234";
    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

    const videoURL = "https://www.youtube.com/watch?v=jdYJf_ybyVo";
    await wrapper
      .find('[data-test="videoLinkInput"]')
      .find('[data-test="input"]')
      .setValue(videoURL);

    expect(wrapper.vm.isSpinnerShown).toBeTruthy();

    mockAxios.mockError();

    await flushPromises();

    expect(hideSpinner).toHaveBeenCalled();
  });

  it("creates video and links to plio when a valid video link is entered", async () => {
    const checkAndSaveChanges = jest.spyOn(
      Editor.methods,
      "checkAndSaveChanges"
    );
    const plioId = "1234";
    wrapper = mount(Editor, {
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
    expect(wrapper.find('[data-test="previewSkeleton"]').exists()).toBeTruthy();
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

    // mock the response from youtube api for fetching video details
    mockAxios.mockResponse(
      {
        data: global.dummyYouTubeResponse,
      },
      mockAxios.queue()[0]
    );
    await flushPromises();

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
      duration: videoDuration,
    });

    mockAxios.mockResponse(
      {
        data: global.dummyVideo,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    expect(mockAxios.patch).toHaveBeenCalledTimes(1);
    expect(mockAxios.patch).toHaveBeenCalledWith(`/plios/${plioId}`, {
      video: global.dummyVideo.id,
    });
  });

  describe("updating a video", () => {
    const initialVideoId = "jdYJf_ybyVo";
    const initialVideoURL = `https://www.youtube.com/watch?v=${initialVideoId}`;
    const newVideoId = "abcdefghijk";
    const newVideoURL = `https://www.youtube.com/watch?v=${newVideoId}`;

    const mountWrapper = async () => {
      wrapper = mount(Editor, {
        data() {
          return {
            videoId: initialVideoId,
            videoURL: initialVideoURL,
            isVideoIdValid: true,
            videoDBId: global.dummyVideo.id,
          };
        },
      });
      await flushPromises();
      // this is required - DO NOT REMOVE THIS
      console.log(wrapper.vm.player);

      mockAxios.mockResponse(
        clonedeep(global.dummyDraftPlio),
        mockAxios.queue()[0]
      );
    };

    it("updates video when a new valid URL is updated when no item with time > duration is present", async () => {
      const checkAndSaveChanges = jest.spyOn(
        Editor.methods,
        "checkAndSaveChanges"
      );

      await mountWrapper();

      await wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="input"]')
        .setValue("invalid video url");

      // since an invalid url was given, the video Id should remain the same
      expect(wrapper.vm.videoId).toBe(initialVideoId);

      await wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="input"]')
        .setValue(newVideoURL);

      // mock the response from youtube api for fetching video details
      mockAxios.mockResponse(
        {
          data: global.dummyYouTubeResponse,
        },
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();

      expect(wrapper.vm.videoId).toBe("abcdefghijk");
      expect(checkAndSaveChanges).toHaveBeenCalledWith(
        "video",
        global.dummyVideo.id,
        {
          duration: videoDuration,
          url: newVideoURL,
        }
      );

      expect(mockAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        `/videos/${global.dummyVideo.id}`,
        {
          url: newVideoURL,
          duration: videoDuration,
        }
      );
    });

    it("does not update video id when a new valid but non-existing video link is added", async () => {
      await mountWrapper();

      await wrapper
        .find('[data-test="videoLinkInput"]')
        .find('[data-test="input"]')
        .setValue(newVideoURL);

      // mock the response from youtube api for non-existing video
      mockAxios.mockResponse(
        {
          data: global.dummyEmptyYouTubeResponse,
        },
        mockAxios.queue()[0]
      );

      // wait until the DOM updates after promises resolve
      await flushPromises();

      expect(wrapper.vm.videoId).toBe(initialVideoId);
    });

    describe("dialog for confirming video updation when video duration < timestamp of some items", () => {
      const newVideoDuration = 100;
      let removeItems;

      beforeEach(async () => {
        removeItems = jest.spyOn(Editor.methods, "removeItems");
        await mountWrapper();

        await wrapper
          .find('[data-test="videoLinkInput"]')
          .find('[data-test="input"]')
          .setValue(newVideoURL);

        // mock the response from youtube api for video with duration
        // less than the timestamp of some items
        let dummyYoutubeResponse = clonedeep(global.dummyYouTubeResponse);
        dummyYoutubeResponse.items[0].contentDetails.duration = "PT1M40S";
        mockAxios.mockResponse(
          {
            data: dummyYoutubeResponse,
          },
          mockAxios.queue()[0]
        );

        // wait until the DOM updates after promises resolve
        await flushPromises();
      });

      it("shows a dialog box to confirm video updation", async () => {
        // video details should be set
        expect(wrapper.vm.newVideoDetails.videoId).toBe(newVideoId);
        expect(wrapper.vm.newVideoDetails.videoURL).toBe(newVideoURL);
        expect(wrapper.vm.newVideoDetails.videoDuration).toBe(newVideoDuration);
        expect(wrapper.vm.newVideoDetails.oldVideoURL).toBe(initialVideoURL);

        // dialog should be shown
        expect(store.state.dialog.isShown).toBeTruthy();
      });

      it("reverts video url to old video url upon dialog cancellation", async () => {
        expect(wrapper.vm.videoURL).toBe(newVideoURL);

        // trigger dialog cancellation
        store.dispatch("dialog/setCancelClicked");

        await flushPromises();

        expect(wrapper.vm.videoURL).toBe(initialVideoURL);
      });

      it("updates video upon dialog confirmation", async () => {
        // trigger dialog confirmation
        store.dispatch("dialog/setConfirmClicked");

        await flushPromises();

        expect(wrapper.vm.videoId).toBe(newVideoId);
        expect(mockAxios.patch).toHaveBeenCalledWith(
          `/videos/${global.dummyVideo.id}`,
          {
            url: newVideoURL,
            duration: newVideoDuration,
          }
        );
      });

      it("deletes items upon dialog confirmation", async () => {
        // trigger dialog confirmation
        store.dispatch("dialog/setConfirmClicked");

        await flushPromises();

        const expectedItemDeleteStartIndex = 2;
        const expectedNumItemsToRemove = 3;
        const expectedItemIdsToDelete = [];
        for (
          let index = global.dummyItemsWithItemDetails.length - 1;
          index >= expectedItemDeleteStartIndex;
          index--
        ) {
          expectedItemIdsToDelete.push(
            global.dummyItemsWithItemDetails[index].id
          );
        }

        expect(mockAxios.delete).toHaveBeenCalledWith(`/items/bulk_delete/`, {
          data: {
            id: expectedItemIdsToDelete,
          },
        });
        expect(removeItems).toHaveBeenCalledWith(
          expectedItemDeleteStartIndex,
          expectedNumItemsToRemove
        );
        expect(wrapper.vm.items.length).toBe(
          global.dummyItemsWithItemDetails.length - expectedNumItemsToRemove
        );
      });
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
    wrapper = mount(Editor, {
      global: {
        stubs: {
          DialogBox: {
            template: "<span />",
          },
        },
      },
    });
    await wrapper.setData({
      videoId: "jdYJf_ybyVo",
      status: "published",
      isVideoIdValid: true,
    });

    // since the video is updated, the app will be in the uploading state
    // this resets it
    mockAxios.reset();
    await store.dispatch("sync/stopUploading");

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
    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
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
        workspace: "",
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
    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // mock the response from youtube api for fetching video details
    mockAxios.mockResponse(
      {
        data: global.dummyYouTubeResponse,
      },
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // since the video is updated, the app will be in the uploading state
    // this resets it
    mockAxios.reset();
    await store.dispatch("sync/stopUploading");

    // preview should not be shown by default
    expect(wrapper.vm.isPlioPreviewShown).toBeFalsy();
    expect(wrapper.vm.isPlioPreviewLoaded).toBeFalsy();

    await wrapper.find('[data-test="plioPreviewButton"]').trigger("click");

    expect(togglePlioPreviewMode).toHaveBeenCalled();
    expect(wrapper.vm.isPlioPreviewShown).toBeTruthy();

    // resolve the `GET` request waiting in the queue (for receiving plio details)
    // using the fake response data
    let plioResponse = clonedeep(global.dummyDraftPlio);

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

    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
        };
      },
    });

    // resolve the loadPlio method with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // mock the response from youtube api for fetching video details
    mockAxios.mockResponse(
      {
        data: global.dummyYouTubeResponse,
      },
      mockAxios.queue()[0]
    );

    // wait until the DOM updates after promises resolve
    await flushPromises();

    // since the video is updated, the app will be in the uploading state
    // this resets it
    mockAxios.reset();
    await store.dispatch("sync/stopUploading");

    await wrapper.find('[data-test="plioPreviewButton"]').trigger("click");

    // resolve the getPlio method within Plio.vue with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
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
    wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
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
        workspace: "",
      },
    });
  });

  it("checks that no question time is smaller than minimum question timestamp", async () => {
    wrapper = mount(Editor, { shallow: true });
    // defined in Editor.vue, cannot access the variable from there,
    // hence harcoding here
    const MINIMUM_QUESTION_TIMESTAMP = 0.6;

    // set items, currentItemIndex and itemDetails
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      currentItemIndex: 0,
      itemDetails: global.dummyItemDetails,
    });

    // resolve the loadPlio method call with dummy plio details
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
    await flushPromises();

    // without any change, the time value of the first item should be the same as
    // originally provided
    expect(wrapper.vm.items[0].time).toBe(global.dummyItems[0].time);

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
    wrapper = mount(Editor);

    await wrapper.setData({ plioTitle: "title for plio" });
    expect(wrapper.vm.loadedPlioDetails.plioTitle).not.toBe(
      wrapper.vm.plioTitle
    );
    expect(checkAndSaveChanges).toHaveBeenCalled();
  });

  it("computes the itemImage property correctly", async () => {
    wrapper = mount(Editor);

    const imageURL = "test url";
    const dummyItemDetailsWithImage = clonedeep(global.dummyItemDetails);
    dummyItemDetailsWithImage[0].image = {
      id: 56,
      url: imageURL,
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(dummyItemDetailsWithImage),
      currentItemIndex: 0,
    });

    expect(wrapper.vm.itemImage).toBe(imageURL);
  });

  it("computes itemType correctly", async () => {
    wrapper = mount(Editor);
    await wrapper.setData({
      currentItemIndex: 0,
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
    });
    expect(wrapper.vm.itemType).toBe(null);
    await wrapper.setData({
      isItemSelected: true,
    });
    expect(wrapper.vm.itemType).toBe(global.dummyItems[0].type);
  });

  it("computes correctAnswer correctly", async () => {
    wrapper = mount(Editor);
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: 0,
    });
    expect(wrapper.vm.correctAnswer).toBe(
      global.dummyItemDetails[0].correct_answer
    );
  });

  it("renders publish button tooltip correctly", async () => {
    wrapper = mount(Editor, {
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
      "Click to publish the changes you've made"
    );
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
    const publishPlio = jest.spyOn(Editor.methods, "publishPlio");
    const updatePlioSettings = jest
      .spyOn(PlioAPIService, "updatePlioSettings")
      .mockImplementation(() => {
        return;
      });

    wrapper = mount(Editor, {
      data() {
        const confetti = require("canvas-confetti");
        // have to create it manually as jest creates a DIV instead of CANVAS on its own
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.setAttribute("id", "sharePlioConfettiCanvas");
        const confettiHandler = confetti.create(confettiCanvas, {
          resize: true,
        });
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
          videoDBId: global.dummyVideo.id,
          confettiHandler: confettiHandler,
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
        };
      },
      props: {
        plioId: String(global.dummyPublishedPlio.data.id),
      },
    });

    // reset the getPlio request made by Editor
    mockAxios.reset();

    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(store.state.dialog.title).toBe(
      "Are you sure you want to publish the plio?"
    );
    expect(store.state.dialog.description).toBe(
      "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question. You can also preview the plio before publishing it."
    );
    expect(store.state.dialog.confirmButtonConfig).toStrictEqual({
      enabled: true,
      text: "Publish",
      class:
        "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
    });
    expect(store.state.dialog.cancelButtonConfig).toStrictEqual({
      enabled: true,
      text: "Preview",
      class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
    });
    expect(wrapper.vm.dialogAction).toBe("publish");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();

    await wrapper.setData({ status: "published" });
    await wrapper.find('[data-test="publishButton"]').trigger("click");
    expect(store.state.dialog.title).toBe(
      "Are you sure you want to publish your changes?"
    );
    expect(store.state.dialog.description).toBe(
      "The plio will be permananently changed once you publish the changes"
    );
    expect(store.state.dialog.confirmButtonConfig).toStrictEqual({
      enabled: true,
      text: "Yes",
      class:
        "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0",
    });
    expect(store.state.dialog.cancelButtonConfig).toStrictEqual({
      enabled: true,
      text: "No",
      class: "bg-white hover:bg-gray-100 focus:outline-none text-primary",
    });

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    expect(publishPlio).toHaveBeenCalled();
    expect(updatePlioSettings).toHaveBeenCalled();
    expect(wrapper.vm.status).toBe("published");
    expect(saveChanges).toHaveBeenCalledWith("all");

    // video update check
    expect(updateVideo).toHaveBeenCalled();

    // mock video response
    mockAxios.mockResponse(
      {
        data: global.dummyVideo,
      },
      mockAxios.queue()[0]
    );

    await flushPromises();

    // 1 call to /items and /questions for each item and 1 call to /plio
    expect(mockAxios.queue().length).toBe(global.dummyItems.length * 2 + 1);
    expect(updateItem).toHaveBeenCalledTimes(global.dummyItems.length);

    // mock responses to requests for /items
    global.dummyItems.forEach((item) => {
      mockAxios.mockResponse(
        {
          data: item,
        },
        mockAxios.queue()[0]
      );
    });

    await flushPromises();

    expect(updateQuestionDetails).toHaveBeenCalledTimes(
      global.dummyItemDetails.length
    );

    // mock responses to requests for /questions
    global.dummyItemDetails.forEach((itemDetails) => {
      mockAxios.mockResponse(
        {
          data: itemDetails,
        },
        mockAxios.queue()[0]
      );
    });

    await flushPromises();

    expect(updatePlio).toHaveBeenCalled();
  });

  it("clicking on preview button of publish confirmation dialog shows plio preview", async () => {
    const togglePlioPreviewMode = jest.spyOn(
      Editor.methods,
      "togglePlioPreviewMode"
    );
    wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
        };
      },
    });
    await wrapper.find('[data-test="publishButton"]').trigger("click");

    // simulate clicking the cancel button of the dialog box
    await simulateCancelClick();

    expect(togglePlioPreviewMode).toHaveBeenCalled();
  });

  it("clicking on cancel button of publish confirmation dialog for published plio closes dialog", async () => {
    const togglePlioPreviewMode = jest.spyOn(
      Editor.methods,
      "togglePlioPreviewMode"
    );
    wrapper = mount(Editor, {
      data() {
        return {
          videoId: "abcdefgh",
          status: "published",
          isVideoIdValid: true,
        };
      },
    });
    await wrapper.find('[data-test="publishButton"]').trigger("click");

    // simulate clicking the cancel button of the dialog box
    await simulateCancelClick();

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

    wrapper = mount(Editor, {
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
        workspace: "",
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

    wrapper = mount(Editor, {
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
      isVideoIdValid: true,
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
    wrapper = mount(Editor, {
      props: {
        plioId: plioId,
      },
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
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

    wrapper = mount(Editor, {
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
        workspace: "",
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

    wrapper = mount(Editor, {
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
      isVideoIdValid: true,
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
    wrapper = mount(Editor);
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
    wrapper = mount(Editor, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
      data() {
        return {
          videoId: "abcdefgh",
          isVideoIdValid: true,
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
        workspace: "",
        plioId: "",
      },
    });
  });

  it("deletes linked image properly", async () => {
    const deleteLinkedImage = jest.spyOn(Editor.methods, "deleteLinkedImage");
    wrapper = mount(Editor);

    const dummyItemDetailsWithImage = clonedeep(global.dummyItemDetails);
    dummyItemDetailsWithImage[0].image = {
      id: 56,
      url: "https://plio-prod-assets.s3.amazonaws.com/images/hxojrjdasf.png",
      alt_text: "Image",
      created_at: "2021-07-02T12:58:41.683683Z",
      updated_at: "2021-07-02T12:58:41.684174Z",
    };

    await wrapper.setData({
      isImageUploaderDialogShown: true,
      items: clonedeep(global.dummyItems),
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
    wrapper = mount(Editor);
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      isImageUploaderDialogShown: true,
      currentItemIndex: 0,
    });

    let imageUploaderWrapper = wrapper.findComponent(ImageUploaderDialog);
    imageUploaderWrapper.setData({
      localImageData: global.imageData,
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

  it("changes question type upon toggling from item editor", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
          currentItemIndex: 0,
          videoDuration: 200,
          status: "draft",
          currentQuestionTypeIndex: 0,
        };
      },
    });

    const newQuestionType = "subjective";
    wrapper.vm.$refs.itemEditor.$emit("question-type-changed", newQuestionType);

    // the option index to delete must be set
    expect(wrapper.vm.itemDetails[0].type).toBe(newQuestionType);
  });

  it("delete option button is hidden with only 2 options", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    // clear past values of dialog description
    await store.dispatch("dialog/unsetDialogDescription");
    expect(inputTextWrapper.find('[data-test="endIcon"]').exists()).toBeFalsy();
  });

  it("cancelling delete option dialog resets option's index to delete", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    let updatedDummyItemDetails = clonedeep(global.dummyItemDetails);
    updatedDummyItemDetails[0].options.push("option 3");
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: updatedDummyItemDetails,
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");

    // the option index to delete must be set
    expect(wrapper.vm.optionIndexToDelete).toBe(1);

    // simulate clicking the cancel button of the dialog box
    await simulateCancelClick();

    // the option index to delete must now be reset
    expect(wrapper.vm.optionIndexToDelete).toBe(-1);
  });

  it("delete option works with more than 2 options", async () => {
    const endIconSelected = jest.spyOn(InputText.methods, "endIconSelected");
    const itemEditorDeleteOption = jest.spyOn(
      ItemEditor.methods,
      "deleteOption"
    );
    const editorDeleteOption = jest.spyOn(Editor.methods, "deleteOption");
    const deleteSelectedOption = jest.spyOn(
      Editor.methods,
      "deleteSelectedOption"
    );

    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    // add another option to allow deleting an option
    let updatedDummyItemDetails = clonedeep(global.dummyItemDetails);
    updatedDummyItemDetails[0].options.push("option 3");
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: updatedDummyItemDetails,
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

    expect(store.state.dialog.title).toBe(
      "Are you sure you want to delete this option?"
    );
    expect(store.state.dialog.description).toBe("");
    expect(store.state.dialog.confirmButtonConfig.enabled).toBeTruthy();
    expect(store.state.dialog.confirmButtonConfig.text).toBe("Yes");
    expect(store.state.dialog.confirmButtonConfig.class).toBe(
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(store.state.dialog.cancelButtonConfig.enabled).toBeTruthy();
    expect(store.state.dialog.cancelButtonConfig.text).toBe("No");
    expect(store.state.dialog.cancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );
    expect(wrapper.vm.dialogAction).toBe("deleteOption");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
    expect(wrapper.vm.optionIndexToDelete).toBe(1);

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    expect(deleteSelectedOption).toHaveBeenCalled();
    expect(wrapper.vm.optionIndexToDelete).toBe(-1);
    expect(wrapper.vm.itemDetails[0].options.length).toBe(2);
  });

  it("deleting correct answer option resets correct answer", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    let updatedDummyItemDetails = clonedeep(global.dummyItemDetails);
    updatedDummyItemDetails[0].options.push("option 3");
    updatedDummyItemDetails[0].correct_answer = 2;
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: updatedDummyItemDetails,
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[5];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");

    // the option index to delete must be set
    expect(wrapper.vm.optionIndexToDelete).toBe(2);

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    // the correct answer must now be reset
    expect(wrapper.vm.itemDetails[0].correct_answer).toBe(0);
  });

  it("deleting option with index lower than correct answer updates correct answer", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    let updatedDummyItemDetails = clonedeep(global.dummyItemDetails);
    updatedDummyItemDetails[0].options.push("option 3");
    updatedDummyItemDetails[0].correct_answer = 2;
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: updatedDummyItemDetails,
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");

    // the option index to delete must be set
    expect(wrapper.vm.optionIndexToDelete).toBe(1);

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    // the correct answer must now be reset
    expect(wrapper.vm.itemDetails[0].correct_answer).toBe(1);
  });

  it("deleting checkbox option which was one of the answers removes it from the answer", async () => {
    const questionTypeIndex = 4;
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
          items: clonedeep(global.dummyItems),
          itemDetails: clonedeep(global.dummyItemDetails),
          currentItemIndex: questionTypeIndex,
          videoDuration: 200,
          status: "draft",
          currentQuestionTypeIndex: 2,
        };
      },
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");
    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();
    // correct answer should be updated and the index of the options with index
    // greater than the index of the deleted option should be decremented by 1
    expect(
      wrapper.vm.itemDetails[questionTypeIndex].correct_answer
    ).toStrictEqual([1]);
  });

  it("deleting checkbox option which was the only correct answer resets the correct answer", async () => {
    const questionTypeIndex = 4;
    let updatedItemDetails = clonedeep(global.dummyItemDetails);
    updatedItemDetails[questionTypeIndex].correct_answer = [1];
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
          items: clonedeep(global.dummyItems),
          itemDetails: updatedItemDetails,
          currentItemIndex: questionTypeIndex,
          videoDuration: 200,
          status: "draft",
          currentQuestionTypeIndex: 2,
        };
      },
    });

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);
    const inputTextWrapper = itemEditorWrapper.findAllComponents(InputText)[4];

    await inputTextWrapper.find('[data-test="endIcon"]').trigger("click");
    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();
    // correct answer should be reset to the first option
    expect(
      wrapper.vm.itemDetails[questionTypeIndex].correct_answer
    ).toStrictEqual([0]);
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
    wrapper = mount(Editor, {
      global: {
        mocks: {
          player: mockPlayer,
        },
      },
    });
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      isVideoIdValid: true,
      currentTimestamp: 15.6,
    });

    // resolve the loadPlio method call with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
    await flushPromises();

    // trying to add an item where another item already exists is not possible
    // this will show an error dialog
    await wrapper.find('[data-test="addMCQItem"]').trigger("click");
    expect(addNewItem).toHaveBeenCalled();
    expect(showCannotAddItemDialog).toHaveBeenCalled();
    expect(wrapper.vm.pending).toBeFalsy();

    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      currentTimestamp: 12,
      plioDBId: 13,
    });
    await store.dispatch("sync/stopLoading");

    // the item will be added now because the timestamp is not clashing
    // with the timestamp of another item
    await wrapper
      .find('[data-test="addCheckboxQuestionItem"]')
      .trigger("click");
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
      correct_answer: [0],
      text: "",
      type: "checkbox",
      options: ["", ""],
      max_char_limit: 100,
      item: createdItemResponse.data.id,
    });

    let createdQuestionResponse = {
      data: {
        id: 212,
        item: 212,
        text: "",
        type: "checkbox",
        options: ["", ""],
        correct_answer: [0],
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

    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: null,
      videoId: "jdYJf_ybyVo",
      currentTimestamp: 20,
      plioDBId: 13,
    });
    await store.dispatch("sync/stopLoading");

    // add an MCQ question
    await wrapper.find('[data-test="addMCQItem"]').trigger("click");
    expect(addNewItem).toHaveBeenCalled();

    expect(mockAxios.post).toHaveBeenCalledWith("/items/", {
      plio: 13,
      type: "question",
      time: 20,
      meta: { source: { name: "default" } },
    });
    // using some pre-defined dummy data to return as a fake response
    // from the fake API call
    createdItemResponse = {
      data: {
        id: 212,
        plio: 13,
        type: "question",
        time: 20,
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

    createdQuestionResponse = {
      data: {
        id: 212,
        item: 212,
        text: "",
        type: "mcq",
        options: ["", ""],
        correct_answer: 0,
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
    const editorDeleteSelectedItem = jest.spyOn(
      Editor.methods,
      "deleteSelectedItem"
    );
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: 0,
      videoDuration: 200,
      status: "draft",
      currentQuestionTypeIndex: 0,
      itemType: "question",
    });

    // resolve the loadPlio method call with a dummy plio
    mockAxios.mockResponse(
      clonedeep(global.dummyDraftPlio),
      mockAxios.queue()[0]
    );
    await flushPromises();

    const itemEditorWrapper = wrapper.findComponent(ItemEditor);

    await itemEditorWrapper.find('[data-test="deleteItem"]').trigger("click");

    expect(itemEditorDeleteSelectedItem).toHaveBeenCalled();
    expect(itemEditorWrapper.emitted()).toHaveProperty("delete-selected-item");
    expect(showDeleteItemDialogBox).toHaveBeenCalled();

    expect(store.state.dialog.title).toBe(
      "Are you sure you want to delete this?"
    );
    expect(store.state.dialog.description).toBe(
      "This will permanently delete this question"
    );
    expect(store.state.dialog.confirmButtonConfig.enabled).toBeTruthy();
    expect(store.state.dialog.confirmButtonConfig.text).toBe("Yes");
    expect(store.state.dialog.confirmButtonConfig.class).toBe(
      "bg-primary hover:bg-primary-hover focus:outline-none focus:ring-0"
    );
    expect(store.state.dialog.cancelButtonConfig.enabled).toBeTruthy();
    expect(store.state.dialog.cancelButtonConfig.text).toBe("No");
    expect(store.state.dialog.cancelButtonConfig.class).toBe(
      "bg-white hover:bg-gray-100 focus:outline-none text-primary"
    );

    expect(wrapper.vm.dialogAction).toBe("deleteItem");
    expect(wrapper.vm.isDialogBoxShown).toBeTruthy();

    expect(wrapper.vm.itemUnwatchers[global.dummyItems[0].id]).toBeTruthy();

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    expect(editorDeleteSelectedItem).toHaveBeenCalled();
    expect(clearItemAndItemDetailWatcher).toHaveBeenCalled();
    expect(wrapper.vm.itemUnwatchers[global.dummyItems[0].id]).toBe(undefined);
    expect(wrapper.vm.itemDetailUnwatchers[global.dummyItems[0].id]).toBe(
      undefined
    );
    expect(wrapper.vm.items.length).toBeLessThan(global.dummyItems.length);
  });

  it("updating plio title calls saveChanges with resource as plio", async () => {
    const saveChanges = jest.spyOn(Editor.methods, "saveChanges");
    const plioId = String(global.dummyPublishedPlio.data.id);
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
          plioTitle: global.dummyPublishedPlio.data.title,
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
    wrapper = mount(Editor);

    await wrapper.setData({
      isModalMinimized: false,
      isItemSelected: true,
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: 0,
      videoId: "jdYJf_ybyVo",
      isVideoIdValid: true,
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
    wrapper = mount(Editor);
    await wrapper.setData({
      items: clonedeep(global.dummyItems),
      itemDetails: clonedeep(global.dummyItemDetails),
      currentItemIndex: 1,
      isItemSelected: true,
      isModalMinimized: true,
      videoId: "jdYJf_ybyVo",
      isVideoIdValid: true,
    });

    await wrapper.find('[data-test="maximizeButton"]').trigger("click");
    expect(maximizeModal).toHaveBeenCalled();
    expect(wrapper.vm.isModalMinimized).toBe(false);
  });

  it("does not interfere with irrelevant dialog confirm trigger", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });

    await wrapper.find('[data-test="publishButton"]').trigger("click");

    // change the dialog action so that it is no longer
    // relevant to this component
    const newDialogAction = "testAction";
    await store.dispatch("dialog/setDialogAction", newDialogAction);

    // simulate clicking the confirm button of the dialog box
    await simulateConfirmClick();

    // the dialog action shouldn't have been affected and
    // the confirm click status should remain active
    expect(wrapper.vm.isDialogConfirmClicked).toBeTruthy();
    expect(wrapper.vm.dialogAction).toBe(newDialogAction);

    // reset dialog confirm clicked status
    await store.dispatch("dialog/unsetConfirmClicked");
  });

  it("does not interfere with irrelevant dialog cancel trigger", async () => {
    wrapper = mount(Editor, {
      data() {
        return {
          isVideoIdValid: true,
        };
      },
    });

    await wrapper.find('[data-test="publishButton"]').trigger("click");

    // change the dialog action so that it is no longer
    // relevant to this component
    const newDialogAction = "testAction";
    await store.dispatch("dialog/setDialogAction", newDialogAction);

    // simulate clicking the cancel button of the dialog box
    await simulateCancelClick();

    // the dialog action shouldn't have been affected and
    // the cancel click status should remain active
    expect(wrapper.vm.isDialogCancelClicked).toBeTruthy();
    expect(wrapper.vm.dialogAction).toBe(newDialogAction);

    // reset dialog cancel clicked status
    await store.dispatch("dialog/unsetCancelClicked");
  });

  describe("settings", () => {
    const mountWrapper = (
      params = {
        data() {
          return {
            settingsToRender: clonedeep(global.dummySettingsToRender),
          };
        },
      }
    ) => {
      wrapper = mount(Editor, params);
    };

    beforeEach(async () => {
      jest.restoreAllMocks();

      mountWrapper();
    });

    afterEach(async () => {
      if (wrapper != undefined) wrapper.unmount();
      await store.dispatch("auth/setActiveWorkspace", "");
      await store.dispatch("auth/unsetUser");
    });

    it("closes settings menu properly", async () => {
      await wrapper.setData({
        isSettingsMenuShown: true,
      });
      let settingsMenu = wrapper.get('[data-test="settings"]');
      expect(settingsMenu.exists()).toBeTruthy();
      wrapper.vm.$refs.settings.$emit("window-closed");
      expect(wrapper.vm.isSettingsMenuShown).toBeFalsy();
    });

    it("opens settings menu when settings icon is clicked", async () => {
      expect(wrapper.vm.isSettingsMenuShown).toBeFalsy();
      expect(wrapper.vm.hasAnySettingsToRender).toBeTruthy();
      await wrapper.get('[data-test="settingsButton"]').trigger("click");
      expect(wrapper.vm.isSettingsMenuShown).toBeTruthy();
      expect(wrapper.get('[data-test="settings"]').exists()).toBeTruthy();
    });

    it("shows settings with organization scope even if user does not have access to them", async () => {
      let dummySkipEnabledValue = true;
      let dummyPlio = clonedeep(global.dummyDraftPlio);
      dummyPlio.data.config = {
        settings: SettingsUtilities.encodeMapToPayload(
          clonedeep(global.dummyGlobalSettings)
        ),
      };

      await store.dispatch("auth/setUser", clonedeep(global.dummyUser));
      mockAxios.reset();

      // mount the component
      await mountWrapper({
        data() {
          return {
            isSettingsMenuShown: false,
          };
        },
        props: {
          plioId: "mlungtvmyl",
        },
      });

      // resolve the loadPlio request with the dummy plio prepared above
      mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
      await flushPromises();

      // in personal workspace, the user should be able to see plio's all settings
      expect(
        wrapper.vm.settingsToRender
          .get("player")
          .get("configuration")
          .get("skipEnabled").value
      ).toBe(dummySkipEnabledValue);

      // switching to o1 workspace
      await store.dispatch("auth/setActiveWorkspace", "o1");
      await flushPromises();

      // on the editor, the scope of the user is not taken into account for
      // all the settings, regardless of the scope, will be visible to the user
      expect(
        wrapper.vm.settingsToRender
          .get("player")
          .get("configuration")
          .get("skipEnabled")
      ).not.toBe(undefined);

      // switching to o2 workspace
      await store.dispatch("auth/setActiveWorkspace", "o2");
      await flushPromises();

      // on the editor, the scope of the user is not taken into account for
      // all the settings, regardless of the scope, will be visible to the user
      expect(wrapper.vm.settingsToRender.get("player")).not.toBe(undefined);
    });

    describe("Watching and updation of settings", () => {
      let updatePlioSettings;
      let dummyPlio;
      store.dispatch("generic/setWindowInnerWidth", 1024);
      beforeEach(async () => {
        // set global default settings as the user's settings
        await store.dispatch(
          "auth/setUserSettings",
          global.dummyGlobalSettings
        );

        jest.restoreAllMocks();

        // prepare a dummy plio with proper settings in its config
        dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = {
          settings: SettingsUtilities.encodeMapToPayload(
            clonedeep(global.dummyGlobalSettings)
          ),
        };
        mockAxios.reset();
        updatePlioSettings = jest
          .spyOn(PlioAPIService, "updatePlioSettings")
          .mockImplementation(() => {
            return;
          });
        // mount the component
        mountWrapper({
          data() {
            return {
              isSettingsMenuShown: false,
            };
          },
          props: {
            plioId: "mlungtvmyl",
          },
        });

        // resolve the loadPlio request with the dummy plio prepared above
        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();
      });

      afterEach(() => {
        mockAxios.reset();
        wrapper.unmount();
      });

      it("watches and updates the settings in a draft plio", async () => {
        // click the settings icon, the settings component should open up
        await wrapper.get('[data-test="settingsButton"]').trigger("click");

        // find the settings component, click one of the setting values and click save
        let settingsComponent = wrapper.findComponent(Settings);
        await settingsComponent.find('[data-test="input"]').trigger("click");
        await settingsComponent
          .find('[data-test="saveButton"]')
          .trigger("click");
        // the settings component should emit the updated settings
        expect(settingsComponent.emitted()).toHaveProperty("update:settings");
        // the local value of plio settings should get updated by the action above
        expect(
          wrapper.vm.plioSettings
            .get("player")
            .children.get("configuration")
            .children.get("skipEnabled").value
        ).toBeFalsy();
        // the method to update the plio's settings to the DB should've been called
        expect(updatePlioSettings).toHaveBeenCalled();
      });

      it("watches and updates the settings when plio is published in a published plio", async () => {
        // turn the plio into a published plio
        await wrapper.setData({
          status: "published",
        });
        // click the settings icon, the settings component should open up
        await wrapper.get('[data-test="settingsButton"]').trigger("click");
        // find the settings component, click one of the setting values and click save
        let settingsComponent = wrapper.findComponent(Settings);
        await settingsComponent.find('[data-test="input"]').trigger("click");
        await settingsComponent
          .find('[data-test="saveButton"]')
          .trigger("click");
        // the settings component should emit the updated settings
        expect(settingsComponent.emitted()).toHaveProperty("update:settings");
        // the local value of plio settings should get updated by the action above
        expect(
          wrapper.vm.plioSettings
            .get("player")
            .children.get("configuration")
            .children.get("skipEnabled").value
        ).toBeFalsy();
        // the method to update the plio's settings to the DB should have been called
        // because the plio gets published when save is clicked
        expect(updatePlioSettings).toHaveBeenCalled();
      });
    });

    describe("Handling of different plio configs", () => {
      let plioId = "mlungtvmyl";
      let constructSettingsMenu;

      let loginNewUser = async (user) => {
        jest.restoreAllMocks();
        // mock the API call to get the user and provide our created user as fake data
        jest
          .spyOn(UserAPIService, "getUserByAccessToken")
          .mockImplementation(() => {
            return new Promise((resolve) => {
              resolve({ data: user });
            });
          });
        // destroy the wrapper
        if (wrapper != undefined) wrapper.unmount();
        // set the new user
        await store.dispatch("auth/setAccessToken", global.dummyAccessToken);
      };

      beforeEach(async () => {
        mockAxios.reset();
        // before each test, restore the mocks to their original implementation
        jest.restoreAllMocks();
        constructSettingsMenu = jest.spyOn(
          Editor.methods,
          "constructSettingsMenu"
        );

        // set workspace to personal workspace
        await store.dispatch("auth/setActiveWorkspace", "");
        // set the user
        await store.dispatch("auth/setUser", global.dummyUser);
        // mount the wrapper before each test
        mountWrapper({
          props: {
            plioId: plioId,
          },
        });

        await loginNewUser(global.dummyUser);
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it("handles fetched plio config which is null", async () => {
        // GET request to retrieve plio details
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
        expect(mockAxios.get).toHaveBeenCalledWith(`/plios/${plioId}`);

        // simulating the plio's fetched config as being null
        let dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = null;
        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();

        expect(constructSettingsMenu).toHaveBeenCalled();
        // the userSettings for player are copied into the plio' settings
        expect(wrapper.vm.plioSettings.get("player")).toStrictEqual(
          wrapper.vm.userSettings.get("player")
        );
      });

      it("handles fetched plio config where settings key is missing", async () => {
        // simulating the plio's fetched config as not containing 'settings' key
        let dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = {
          // contains some random key other than 'settings'
          key: "value",
        };
        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();

        expect(constructSettingsMenu).toHaveBeenCalled();
        // the userSettings for player are copied into the plio's settings
        expect(wrapper.vm.plioSettings.get("player")).toStrictEqual(
          wrapper.vm.userSettings.get("player")
        );
      });

      it("handles fetched plio config where settings key is null", async () => {
        // simulating the plio's fetched config as containing the 'settings' key
        // but the value of that key is null
        let dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = {
          settings: null,
        };

        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();

        expect(constructSettingsMenu).toHaveBeenCalled();
        // the userSettings for player are copied into the plio' settings
        expect(wrapper.vm.plioSettings.get("player")).toStrictEqual(
          wrapper.vm.userSettings.get("player")
        );
      });

      it("handles fetched plio config where player key is missing inside settings key", async () => {
        // simulating the plio's fetched config as containing the 'settings' key
        // but no 'player' key exists inside
        let dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = {
          settings: SettingsUtilities.encodeMapToPayload(
            new Map(
              Object.entries({
                // contains some random key other than 'player'
                key: "value",
              })
            )
          ),
        };

        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();

        expect(constructSettingsMenu).toHaveBeenCalled();
        // the userSettings for player are copied into the plio' settings
        expect(wrapper.vm.plioSettings.get("player")).toStrictEqual(
          wrapper.vm.userSettings.get("player")
        );
      });

      it("handles fetched plio config where all information is present", async () => {
        // the fetched plio's config contains all the required details
        let dummyPlio = clonedeep(global.dummyDraftPlio);
        dummyPlio.data.config = {
          settings: SettingsUtilities.encodeMapToPayload(
            clonedeep(global.dummyGlobalSettings)
          ),
        };

        mockAxios.mockResponse(dummyPlio, mockAxios.queue()[0]);
        await flushPromises();

        expect(constructSettingsMenu).toHaveBeenCalled();
        // the settings from the fetched plio's config are copied into the local
        // plioSettings variable
        expect(wrapper.vm.plioSettings).toStrictEqual(
          new Map(
            Object.entries({
              player: global.dummyGlobalSettings.get("player"),
            })
          )
        );
      });
    });
  });
});
