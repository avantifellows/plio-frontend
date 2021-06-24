import { mount } from "@vue/test-utils";
import LocaleSwitcher from "@/components/App/LocaleSwitcher";

describe("LocaleSwitcher.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(LocaleSwitcher);
    expect(wrapper).toBeTruthy();
  });

  it("test updating switcher triggers updating the locale", () => {
    const updateLocale = jest.spyOn(LocaleSwitcher.methods, "updateLocale");
    const wrapper = mount(LocaleSwitcher);

    const select = wrapper.find('[data-test="select"]').element;
    select.value = "hi";
    select.dispatchEvent(new Event("change"));

    expect(updateLocale).toHaveBeenCalled();
  });
});
