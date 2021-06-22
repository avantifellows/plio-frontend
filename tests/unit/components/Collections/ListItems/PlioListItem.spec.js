import { mount } from "@vue/test-utils";
import PlioListItem from "@/components/Collections/ListItems/PlioListItem";
import Tooltip from "primevue/tooltip";

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

describe("PlioListItem.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(PlioListItem, {
      global: {
        directives: {
          tooltip: Tooltip,
        },
      },
    });
    expect(wrapper).toBeTruthy();
  });
});
