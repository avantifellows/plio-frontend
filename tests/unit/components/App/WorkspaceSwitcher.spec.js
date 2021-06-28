import { mount } from "@vue/test-utils";
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher";

describe("WorkspaceSwitcher.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(WorkspaceSwitcher);
    expect(wrapper).toBeTruthy();
  });

  it("test updating switcher triggers the update method", () => {
    const updateActiveWorkspace = jest.spyOn(
      WorkspaceSwitcher.methods,
      "updateActiveWorkspace"
    );
    const wrapper = mount(WorkspaceSwitcher);

    wrapper.find('[data-test="select"]').trigger("change");

    expect(updateActiveWorkspace).toHaveBeenCalled();
  });
});
