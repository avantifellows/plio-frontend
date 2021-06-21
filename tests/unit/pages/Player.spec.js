import { mount } from "@vue/test-utils";
import Player from "@/pages/Player.vue";

describe("Player.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Player);
    console.log(process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
    console.log(env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
    console.log(wrapper.vm.$mixpanel);
    expect(wrapper).toBeTruthy();
  });
});
