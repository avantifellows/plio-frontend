import { mount } from "@vue/test-utils";
import Player from "@/pages/Player.vue";

describe("Player.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Player);
    expect(wrapper).toBeTruthy();
  });
});
