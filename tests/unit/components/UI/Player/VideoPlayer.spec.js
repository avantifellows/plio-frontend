import { mount } from "@vue/test-utils";
import VideoPlayer from "@/components/UI/Player/VideoPlayer";

describe("VideoPlayer.vue", () => {
  it("should render with default values", () => {
    const wrapper = mount(VideoPlayer);
    expect(wrapper).toBeTruthy();
  });

  it("render with valid video ID", async () => {
    const initiatePlayer = jest.spyOn(VideoPlayer.methods, "initiatePlayer");
    const wrapper = mount(VideoPlayer);

    await wrapper.setProps({
      videoId: "4j4fYyWgl0w",
    });

    expect(initiatePlayer).toHaveBeenCalled();
  });
});
