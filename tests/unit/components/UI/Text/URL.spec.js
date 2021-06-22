import { mount } from "@vue/test-utils";
import URL from "@/components/UI/Text/URL";
import Tooltip from "primevue/tooltip";

// mock document.execCommand
document.execCommand = jest.fn();

describe("URL.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(URL);
  });

  it("should render with default values", () => {
    expect(wrapper).toBeTruthy();
  });

  it("link renders correctly", async () => {
    const link = "testLink";
    await wrapper.setProps({ link: link });

    expect(wrapper.get('[data-test="link"]').text()).toBe(link);
  });

  it("link text class is set correctly", async () => {
    const link = "testLink";
    const linkClass = "w-12 h-12";
    await wrapper.setProps({
      link: link,
      urlStyleClass: linkClass,
    });

    expect(wrapper.get('[data-test="link"]').classes()).toEqual(
      expect.arrayContaining(["w-12", "h-12"])
    );
  });

  it("link text underlining works correctly", async () => {
    const link = "testLink";
    await wrapper.setProps({
      link: link,
      isUnderlined: true,
    });

    expect(wrapper.get('[data-test="link"]').classes()).toEqual(
      expect.arrayContaining(["border-b-2", "border-yellow-500"])
    );
  });

  it("button class is set correctly", async () => {
    const link = "testLink";
    const urlCopyButtonClass = "text-yellow-100";
    await wrapper.setProps({
      link: link,
      urlCopyButtonClass: urlCopyButtonClass,
    });

    expect(wrapper.get('[data-test="copyButton"]').classes()).toContain(
      urlCopyButtonClass
    );
  });

  it("button click is working correctly", async () => {
    const link = "testLink";
    await wrapper.setProps({
      link: link,
    });

    wrapper.get('[data-test="copyButton"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("copied");
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});
