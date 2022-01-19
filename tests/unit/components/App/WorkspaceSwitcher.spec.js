import { mount } from "@vue/test-utils";
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher";
import store from "@/store";

describe("WorkspaceSwitcher.vue", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(WorkspaceSwitcher);
  });
  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  describe("list of workspaces provided", () => {
    const testWorkspaces = [
      {
        id: 1,
        shortcode: "test",
        name: "TestWorkspace",
      },
    ];
    const testWorkspaceIndex = 0;
    const mountWrapper = (params = {}) => {
      store.dispatch("auth/setUser", {
        id: 1,
        organizations: testWorkspaces,
      });
      wrapper = mount(WorkspaceSwitcher, params);
    };

    beforeEach(() => {
      mountWrapper();
    });
    it("displays workspaces apart from personal", () => {
      expect(
        wrapper.find(`[data-test="workspace-${testWorkspaceIndex}"]`).text()
      ).toBe(testWorkspaces[testWorkspaceIndex].name);
    });

    it("test updating switcher triggers the update method", () => {
      const updateActiveWorkspace = jest.spyOn(
        WorkspaceSwitcher.methods,
        "updateActiveWorkspace"
      );
      // mock router
      const mockRouter = {
        push: jest.fn(),
      };
      mountWrapper({
        global: {
          mocks: {
            $router: mockRouter,
          },
        },
      });

      wrapper.find('[data-test="select"]').trigger("change");

      expect(updateActiveWorkspace).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: "Home",
        params: {
          org: "",
        },
      });
    });

    it("changes the selected value if the activeWorkspace is changed", async () => {
      await store.dispatch(
        "auth/setActiveWorkspace",
        testWorkspaces[testWorkspaceIndex].shortcode
      );
      expect(wrapper.vm.selectedWorkspace).toBe(
        testWorkspaces[testWorkspaceIndex].shortcode
      );
    });
  });
});
