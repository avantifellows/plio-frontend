import { mount } from "@vue/test-utils";
import URL from "@/components/UI/Text/URL";
import Tooltip from "primevue/tooltip";

// mock document.execCommand
document.execCommand = jest.fn();

describe("URL.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });

  it("link renders correctly", () => {
    const link = "testLink";
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
      props: {
        link: link,
      },
    });
    expect(wrapper.get('[data-test="link"]').text()).toBe(link);
  });

  it("link text class is set correctly", () => {
    const link = "testLink";
    const linkClass = "w-12 h-12";
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
      props: {
        link: link,
        urlStyleClass: linkClass,
      },
    });
    expect(wrapper.get('[data-test="link"]').classes()).toEqual(
      expect.arrayContaining(["w-12", "h-12"])
    );
  });

  it("link text underlining works correctly", () => {
    const link = "testLink";
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
      props: {
        link: link,
        isUnderlined: true,
      },
    });
    expect(wrapper.get('[data-test="link"]').classes()).toEqual(
      expect.arrayContaining(["border-b-2", "border-yellow-500"])
    );
  });

  it("button class is set correctly", () => {
    const link = "testLink";
    const urlCopyButtonClass = "text-yellow-100";
    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
      props: {
        link: link,
        urlCopyButtonClass: urlCopyButtonClass,
      },
    });
    expect(wrapper.get('[data-test="copyButton"]').classes()).toContain(
      urlCopyButtonClass
    );
  });

  it("button click is working correctly", () => {
    const link = "testLink";

    const wrapper = mount(URL, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
      props: {
        link: link,
      },
    });

    wrapper.get('[data-test="copyButton"]').trigger("click");

    expect(wrapper.emitted()).toHaveProperty("copied");
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });
});
