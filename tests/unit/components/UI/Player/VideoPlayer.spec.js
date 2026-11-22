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

  describe("restoring embed audio on play", () => {
    async function mountAndPlay({ plyrMuted, embedMuted }) {
      const handlers = {};
      const mockPlayer = {
        muted: plyrMuted,
        embed: { isMuted: jest.fn(() => embedMuted), unMute: jest.fn() },
        eventListeners: [],
        on: jest.fn((event, handler) => (handlers[event] = handler)),
      };
      jest
        .spyOn(VideoPlayer.methods, "createPlayer")
        .mockReturnValue(mockPlayer);
      const wrapper = mount(VideoPlayer, { props: { videoId: "4j4fYyWgl0w" } });
      await nextTick();
      handlers.play();
      return { wrapper, mockPlayer };
    }

    it("unmutes the embed when it is muted but the player is not", async () => {
      // a seek before the first play leaves the YouTube embed muted
      const { wrapper, mockPlayer } = await mountAndPlay({
        plyrMuted: false,
        embedMuted: true,
      });

      expect(mockPlayer.embed.unMute).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted("play")).toEqual([[]]);
    });

    it("keeps the embed muted when the learner muted the player", async () => {
      const { mockPlayer } = await mountAndPlay({
        plyrMuted: true,
        embedMuted: true,
      });

      expect(mockPlayer.embed.unMute).not.toHaveBeenCalled();
    });

    it("leaves an unmuted embed alone", async () => {
      const { mockPlayer } = await mountAndPlay({
        plyrMuted: false,
        embedMuted: false,
      });

      expect(mockPlayer.embed.unMute).not.toHaveBeenCalled();
    });
  });

  describe("speed changes outside the allowed speeds", () => {
    async function mountAndChangeRate({ plyrConfig, newSpeed }) {
      const handlers = {};
      const mockPlayer = {
        speed: newSpeed,
        eventListeners: [],
        on: jest.fn((event, handler) => (handlers[event] = handler)),
      };
      jest
        .spyOn(VideoPlayer.methods, "createPlayer")
        .mockReturnValue(mockPlayer);
      mount(VideoPlayer, { props: { videoId: "4j4fYyWgl0w", plyrConfig } });
      await nextTick();
      handlers.ratechange();
      return mockPlayer;
    }

    const limitedConfig = { speed: { selected: 1, options: [1, 1.25] } };

    it("puts a speed set directly on the embed back to the selected speed", async () => {
      const mockPlayer = await mountAndChangeRate({
        plyrConfig: limitedConfig,
        newSpeed: 2,
      });
      expect(mockPlayer.speed).toBe(1);
    });

    it("leaves an allowed speed alone", async () => {
      const mockPlayer = await mountAndChangeRate({
        plyrConfig: limitedConfig,
        newSpeed: 1.25,
      });
      expect(mockPlayer.speed).toBe(1.25);
    });

    it("does nothing when the config doesn't limit speed", async () => {
      const mockPlayer = await mountAndChangeRate({
        plyrConfig: {},
        newSpeed: 2,
      });
      expect(mockPlayer.speed).toBe(2);
    });
  });
});
