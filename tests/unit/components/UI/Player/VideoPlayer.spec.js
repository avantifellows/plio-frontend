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
    const removePlyrPoster = jest.spyOn(
      VideoPlayer.methods,
      "removePlyrPoster"
    );
    const setPlayerProperties = jest.spyOn(
      VideoPlayer.methods,
      "setPlayerProperties"
    );
    const wrapper = mount(VideoPlayer);

    await wrapper.setProps({
      videoId: "4j4fYyWgl0w",
    });

    expect(initiatePlayer).toHaveBeenCalled();
    expect(removePlyrPoster).toHaveBeenCalled();
    expect(setPlayerProperties).toHaveBeenCalled();
  });

  it("should re-render when video ID is changed", async () => {
    const initiatePlayer = jest.spyOn(VideoPlayer.methods, "initiatePlayer");
    const removePlyrPoster = jest.spyOn(
      VideoPlayer.methods,
      "removePlyrPoster"
    );
    const setPlayerProperties = jest.spyOn(
      VideoPlayer.methods,
      "setPlayerProperties"
    );
    const wrapper = mount(VideoPlayer, {
      props: {
        videoId: "4j4fYyWgl0w",
      },
    });

    // changing the video ID
    await wrapper.setProps({
      videoId: "qJWALEoGge4",
    });
    expect(initiatePlayer).toHaveBeenCalled();
    expect(removePlyrPoster).toHaveBeenCalled();
    expect(setPlayerProperties).toHaveBeenCalled();
  });

  it("prevents double click action", async () => {
    const mockPlayer = {
      eventListeners: [
        {
          type: "dblclick",
          element: {
            removeEventListener: jest.fn(),
          },
        },
        {
          type: "click",
          element: {
            removeEventListener: jest.fn(),
          },
        },
      ],
      on: jest.fn(),
    };
    jest.spyOn(VideoPlayer.methods, "createPlayer").mockImplementation(() => {
      return mockPlayer;
    });
    const wrapper = mount(VideoPlayer);

    await wrapper.setProps({
      videoId: "4j4fYyWgl0w",
    });

    expect(
      mockPlayer.eventListeners[0].element.removeEventListener
    ).toHaveBeenCalled();
    expect(
      mockPlayer.eventListeners[1].element.removeEventListener
    ).not.toHaveBeenCalled();
  });

  it("accepts seek, play, pause, and ended commands through the test hook", async () => {
    const mockPlayer = {
      currentTime: 0,
      eventListeners: [],
      on: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
    };
    jest.spyOn(VideoPlayer.methods, "createPlayer").mockReturnValue(mockPlayer);
    const wrapper = mount(VideoPlayer, { props: { videoId: "4j4fYyWgl0w" } });
    await nextTick();

    const playerElement = wrapper.get('[data-test="player-wrapper"]');
    await playerElement.trigger("plio-player-state", {
      detail: { action: "seek", time: 0.75 },
    });
    await playerElement.trigger("plio-player-state", {
      detail: { action: "play" },
    });
    await playerElement.trigger("plio-player-state", {
      detail: { action: "pause" },
    });
    await playerElement.trigger("plio-player-state", {
      detail: { action: "ended" },
    });

    expect(mockPlayer.currentTime).toBe(0.75);
    expect(wrapper.emitted("update")).toEqual([[0.75]]);
    expect(wrapper.emitted("seeked")).toEqual([[0.75]]);
    expect(wrapper.emitted("play")).toEqual([[]]);
    expect(wrapper.emitted("pause")).toEqual([[]]);
    expect(wrapper.emitted("playback-ended")).toEqual([[]]);
  });

  it.each(["production", "staging"])(
    "ignores test-hook events in %s builds",
    async (nodeEnv) => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = nodeEnv;
      try {
        const mockPlayer = {
          currentTime: 0,
          eventListeners: [],
          on: jest.fn(),
          play: jest.fn(),
          pause: jest.fn(),
        };
        jest
          .spyOn(VideoPlayer.methods, "createPlayer")
          .mockReturnValue(mockPlayer);
        const wrapper = mount(VideoPlayer, {
          props: { videoId: "4j4fYyWgl0w" },
        });
        await nextTick();

        const playerElement = wrapper.get('[data-test="player-wrapper"]');
        await playerElement.trigger("plio-player-state", {
          detail: { action: "seek", time: 0.75 },
        });
        await playerElement.trigger("plio-player-state", {
          detail: { action: "ended" },
        });

        expect(mockPlayer.currentTime).toBe(0);
        expect(wrapper.emitted("update")).toBeUndefined();
        expect(wrapper.emitted("seeked")).toBeUndefined();
        expect(wrapper.emitted("playback-ended")).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    }
  );

  it("emits the requested seek time when the video provider cannot advance", async () => {
    const mockPlayer = {
      get currentTime() {
        return 0;
      },
      set currentTime(_) {},
      eventListeners: [],
      on: jest.fn(),
    };
    jest.spyOn(VideoPlayer.methods, "createPlayer").mockReturnValue(mockPlayer);
    const wrapper = mount(VideoPlayer, { props: { videoId: "4j4fYyWgl0w" } });
    await nextTick();

    await wrapper
      .get('[data-test="player-wrapper"]')
      .trigger("plio-player-state", {
        detail: { action: "seek", time: 0.75 },
      });

    expect(wrapper.emitted("update")).toEqual([[0.75]]);
  });
});
