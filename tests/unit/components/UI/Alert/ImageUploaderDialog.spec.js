import { mount } from "@vue/test-utils";
import store from "@/store";
import ImageUploaderDialog from "@/components/UI/Alert/ImageUploaderDialog";

// as window.matchMedia is not defined in the DOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("ImageUploaderDialog.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(ImageUploaderDialog, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
