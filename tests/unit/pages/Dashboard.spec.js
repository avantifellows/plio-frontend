import { mount } from "@vue/test-utils";
import Dashboard from "@/pages/Dashboard.vue";

describe("Dashboard.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Dashboard, {
      props: {
        plioId: "abc",
      },
    });
    expect(wrapper).toBeTruthy();
    // expect(axios.get).toHaveBeenCalledTimes(2);

    // console.log(wrapper.vm.videoID);
  });
});
