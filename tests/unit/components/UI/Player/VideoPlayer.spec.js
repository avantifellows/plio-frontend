import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import VideoPlayer from "@/components/UI/Player/VideoPlayer";

describe("VideoPlayer.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(VideoPlayer);
    expect(wrapper).toBeTruthy();
  });

  it("should render with video Id passed on instantiation", async () => {
    const initiatePlayer = jest.spyOn(VideoPlayer.methods, "initiatePlayer");
    mount(VideoPlayer, {
      props: {
        videoId: "4j4fYyWgl0w",
      },
    });
    await nextTick();
    expect(initiatePlayer).toHaveBeenCalled();
  });

  it("should render with valid video ID", async () => {
    const initiatePlayer = jest.spyOn(VideoPlayer.methods, "initiatePlayer");
    const setPlayerProperties = jest.spyOn(
      VideoPlayer.methods,
      "setPlayerProperties"
    );
    const wrapper = mount(VideoPlayer);

    await wrapper.setProps({
      videoId: "4j4fYyWgl0w",
    });

    expect(initiatePlayer).toHaveBeenCalled();
    expect(setPlayerProperties).toHaveBeenCalled();
  });
});
