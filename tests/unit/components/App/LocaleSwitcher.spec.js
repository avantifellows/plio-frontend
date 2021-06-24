import { mount } from "@vue/test-utils";
import LocaleSwitcher from "@/components/App/LocaleSwitcher";

describe("LocaleSwitcher.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(LocaleSwitcher);
    expect(wrapper).toBeTruthy();
  });

  it("test updating switcher triggers the update method", () => {
    const updateLocale = jest.spyOn(LocaleSwitcher.methods, "updateLocale");
    const wrapper = mount(LocaleSwitcher);

    wrapper.find('[data-test="select"]').trigger("change");

    expect(updateLocale).toHaveBeenCalled();
  });
});
