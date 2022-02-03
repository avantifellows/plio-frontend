import { mount, flushPromises } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";
import store from "@/store";
import mockAxios from "jest-mock-axios";

let clonedeep = require("lodash.clonedeep");

describe("PlioListItem.vue", () => {
  let wrapper;

  beforeEach(async () => {
    await store.dispatch("sync/stopLoading");
    global.setMatchMedia(false);
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

  describe("load variables given plio details", () => {
    let plioDetails = {
      updated_at: new Date(2018, 12, 31),
      status: "draft",
      uuid: "123",
      name: "testTitle",
    };

    const mountWrapper = (
      params = {
        props: {
          plioDetails: plioDetails,
        },
      }
    ) => {
      wrapper = mount(PlioListItem, params);
    };

    beforeEach(() => {
      mountWrapper();
    });

    it("title, updatedAt and status", () => {
      expect(wrapper.vm.updatedAt).toBe(
        plioDetails.updated_at.toDateString().slice(4)
      );
      expect(wrapper.vm.status).toBe(plioDetails.status);
      expect(wrapper.vm.title).toBe(plioDetails.name);
      expect(wrapper.vm.statusBadge).toBe("Draft");
    });

    it("uses placeholder title when no plio title is given", async () => {
      await wrapper.setProps({
        plioDetails: {},
      });
      expect(wrapper.vm.title).toBe("Untitled");
    });

    it("sets isPublished", async () => {
      expect(wrapper.vm.isPublished).toBe(false);
      let updatedPlioDetails = clonedeep(plioDetails);
      updatedPlioDetails.status = "published";

      await wrapper.setProps({
        plioDetails: updatedPlioDetails,
      });
      await flushPromises();
      expect(wrapper.vm.isPublished).toBe(true);
    });

    it("sets whether the current screen is tab screen based on window width", async () => {
      // set the value of the window width
      store.dispatch("generic/setWindowInnerWidth", window.innerWidth);

      // the default screen size should be classified as false
      expect(wrapper.vm.isTabScreen).toBeFalsy();

      // update the value of the window width
      store.dispatch("generic/setWindowInnerWidth", 500);

      // now the screen size should be classified as true
      expect(wrapper.vm.isTabScreen).toBeTruthy();
    });

    describe("action buttons", () => {
      // mock router
      const mockRouter = {
        resolve: jest.fn(() => {
          return {
            href: "test",
          };
        }),
        push: jest.fn(),
      };

      const prepareWrapper = async () => {
        mountWrapper({
          props: {
            plioDetails: plioDetails,
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
      };

      beforeEach(async () => {
        await prepareWrapper();
      });

      it("clicking dropdown shows action buttons", async () => {
        // there should be 7 buttons - edit, play, share, embed, duplicate, delete, analyse
        expect(
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="options"]')
            .findAll("li").length
        ).toBe(7);
      });

      it("disables play for draft plio", async () => {
        expect(
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-play"]')
            .classes()
        ).toContain("cursor-not-allowed");
      });

      it("disables share for draft plio", async () => {
        expect(
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-share"]')
            .classes()
        ).toContain("cursor-not-allowed");
      });

      it("disables analyze for draft plio", async () => {
        expect(
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-analyse"]')
            .classes()
        ).toContain("cursor-not-allowed");
      });

      it("clicking edit redirects to editor for the plio", async () => {
        // click the edit button
        wrapper
          .get('[data-test="optionDropdown"]')
          .find('[data-test="option-edit"]')
          .trigger("click");

        expect(mockRouter.push).toHaveBeenCalledWith({
          name: "Editor",
          params: {
            workspace: "",
            plioId: plioDetails.uuid,
          },
        });
      });

      it("clicking duplicate triggers duplicate function", async () => {
        const duplicatePlio = jest.spyOn(PlioListItem.methods, "duplicatePlio");
        const duplicateThenRoute = jest.spyOn(
          PlioListItem.methods,
          "duplicateThenRoute"
        );

        await prepareWrapper();

        // click the duplicate button
        wrapper
          .get('[data-test="optionDropdown"]')
          .find('[data-test="option-duplicate"]')
          .trigger("click");

        expect(duplicatePlio).toHaveBeenCalled();
        expect(duplicateThenRoute).toHaveBeenCalled();
      });

      describe("clicking on delete", () => {
        const clickDelete = async () => {
          // click the delete button
          await wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-delete"]')
            .trigger("click");
        };
        beforeEach(async () => {
          await clickDelete();
        });

        it("launches a dialog box", async () => {
          // there should be a dialog box now
          expect(wrapper.vm.isDialogBoxShown).toBeTruthy();
        });

        it("choosing no closes the dialog box", async () => {
          // simulate clicking the cancel button of the dialog box
          await global.simulateCancelClick();

          // dialog cancel button state should have been reset
          expect(wrapper.vm.isDialogCancelClicked).toBeFalsy();
          // dialog action should be unset
          expect(wrapper.vm.dialogAction).toBeFalsy();
        });

        describe("choosing yes", () => {
          beforeEach(async () => {
            // simulate clicking the confirm button of the dialog box
            await global.simulateConfirmClick();
          });

          it("requests for deletion of plio and shows spinner", () => {
            // `deletePlio` inside services/API/Plio.js should've been called
            expect(mockAxios.delete).toHaveBeenCalled();
            expect(mockAxios.delete).toHaveBeenCalledWith(
              `/plios/${plioDetails.uuid}`
            );

            // spinner should be shown
            expect(store.state.generic.isSpinnerShown).toBeTruthy();
          });

          it("stops spinner and resets values on successful deletion", async () => {
            // mock the response to the request
            mockAxios.mockResponse(
              {
                status: 204,
              },
              mockAxios.queue()[0]
            );

            await flushPromises();

            // spinner should be reset
            expect(store.state.generic.isSpinnerShown).toBeFalsy();
            // dialog confirm button state should have been reset
            expect(wrapper.vm.isDialogConfirmClicked).toBeFalsy();
            // dialog action should be unset
            expect(wrapper.vm.dialogAction).toBeFalsy();
            // check emit
            // expect(wrapper.emitted()).toHaveProperty("deleted");
          });

          it("closes dialog box if error in deletion", async () => {
            // mock the response to the request
            mockAxios.mockError();

            await flushPromises();

            // spinner should be reset
            expect(store.state.generic.isSpinnerShown).toBeFalsy();
            // dialog confirm button state should have been reset
            expect(wrapper.vm.isDialogConfirmClicked).toBeFalsy();
            // dialog action should be unset
            expect(wrapper.vm.dialogAction).toBeFalsy();
          });
        });

        it("does not interfere with irrelevant dialog confirm trigger", async () => {
          // change the dialog action so that it is no longer
          // relevant to this component
          const newDialogAction = "testAction";
          await store.dispatch("dialog/setDialogAction", newDialogAction);

          // set the dialog confirm button to have been clicked
          await global.simulateConfirmClick();

          // the dialog action shouldn't have been affected and
          // the confirm click status should remain active
          expect(wrapper.vm.isDialogConfirmClicked).toBeTruthy();
          expect(wrapper.vm.dialogAction).toBe(newDialogAction);
        });

        it("does not interfere with irrelevant dialog cancel trigger", async () => {
          // change the dialog action so that it is no longer
          // relevant to this component
          const newDialogAction = "testAction";
          await store.dispatch("dialog/setDialogAction", newDialogAction);

          // set the dialog cancel button to have been clicked
          await global.simulateCancelClick();

          // the dialog action shouldn't have been affected and
          // the cancel click status should remain active
          expect(wrapper.vm.isDialogCancelClicked).toBeTruthy();
          expect(wrapper.vm.dialogAction).toBe(newDialogAction);
        });
      });

      it("shows list of workspaces to select on clicking copy", async () => {
        const testWorkspaces = [
          {
            id: 1,
            shortcode: "test",
            name: "TestWorkspace",
          },
        ];

        // add workspaces for the user
        store.dispatch("auth/setUser", {
          id: 1,
          organizations: testWorkspaces,
        });

        await prepareWrapper();

        // click the copy button
        wrapper
          .get('[data-test="optionDropdown"]')
          .find('[data-test="option-copy"]')
          .trigger("click");

        await flushPromises();

        expect(store.state.generic.selectedPlioId).toBe(plioDetails.uuid);
        expect(store.state.selectors.isShown).toBeTruthy();
        expect(store.state.selectors.type).toBe("single");

        const expectedOptions = [];
        testWorkspaces.forEach((workspace) => {
          expectedOptions.push({
            value: workspace.shortcode,
            label: workspace.name,
          });
        });
        expect(store.state.selectors.options).toEqual(expectedOptions);
      });

      describe("published plio", () => {
        const makePlioPublished = async () => {
          // make plio published
          let updatedPlioDetails = clonedeep(plioDetails);
          updatedPlioDetails.status = "published";

          await wrapper.setProps({
            plioDetails: updatedPlioDetails,
          });
        };
        beforeEach(async () => {
          await makePlioPublished();
        });

        it("clicking play redirects to player for published plio", async () => {
          // click the play button
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-play"]')
            .trigger("click");

          expect(mockRouter.resolve).toHaveBeenCalledWith({
            name: "Player",
            params: {
              workspace: "",
              plioId: plioDetails.uuid,
            },
          });
        });

        it("clicking share shows the share dialog", async () => {
          const sharePlio = jest.spyOn(PlioListItem.methods, "sharePlio");

          await prepareWrapper();
          await makePlioPublished();

          // click the share button
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-share"]')
            .trigger("click");

          expect(sharePlio).toHaveBeenCalled();
        });

        it("clicking embed shows the embed dialog", async () => {
          const embedPlio = jest.spyOn(PlioListItem.methods, "embedPlio");

          await prepareWrapper();
          await makePlioPublished();

          // click the embed button
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-embed"]')
            .trigger("click");

          expect(embedPlio).toHaveBeenCalled();
        });

        it("clicking analyze routes to Dashboard", async () => {
          // click the analyse button
          wrapper
            .get('[data-test="optionDropdown"]')
            .find('[data-test="option-analyse"]')
            .trigger("click");

          expect(mockRouter.push).toHaveBeenCalledWith({
            name: "Dashboard",
            params: {
              workspace: "",
              plioId: plioDetails.uuid,
            },
          });
        });
      });
    });
  });
});
