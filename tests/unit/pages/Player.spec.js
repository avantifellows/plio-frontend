import { mount } from "@vue/test-utils";
import Player from "@/pages/Player.vue";
import mockAxios from "jest-mock-axios";

afterEach(() => {
  // cleaning up the mess left behind by the previous test
  mockAxios.reset();
});

describe("Player.vue", () => {
  it("renders properly with default values", () => {
    const wrapper = mount(Player);
    expect(wrapper).toBeTruthy();
  });

  // uncomment when the back button is revived
  // it("detects if the plio has loaded or not and shows the back button accordingly", async () => {
  //   const plioLoaded = jest.spyOn(Player.methods, "plioLoaded");
  //   const wrapper = mount(Player);

  //   expect(wrapper.vm.isPlioLoaded).toBeFalsy();

  //   // trigger emit from Plio component
  //   wrapper.vm.$refs.plio.$emit("loaded");

  //   expect(plioLoaded).toHaveBeenCalled();
  //   expect(wrapper.vm.isPlioLoaded).toBeTruthy();

  //   expect(wrapper.find('[data-test="back-button"]')).toBeTruthy();
  // });

  // it("takes the user back if back button is clicked", async () => {
  //   // mock router
  //   const mockRouter = {
  //     push: jest.fn(),
  //     options: {
  //       history: {
  //         state: {
  //           // null signifies that the user is not coming
  //           // from a page that belongs to Plio
  //           back: null,
  //         },
  //       },
  //     },
  //   };
  //   // mocking goBack() method
  //   const goBack = jest.spyOn(Player.methods, "goBack");

  //   const wrapper = mount(Player, {
  //     global: {
  //       mocks: {
  //         $router: mockRouter,
  //       },
  //     },
  //   });
  //   // this will make the back button visible
  //   await wrapper.setData({
  //     isPlioLoaded: true,
  //   });
  //   // click the back button
  //   await wrapper.find('[data-test="back-button"]').trigger("click");
  //   expect(goBack).toHaveBeenCalled();
  //   expect(mockRouter.push).toHaveBeenCalledWith({
  //     name: "Home",
  //     params: {
  //       org: "",
  //     },
  //   });
  // });
});
