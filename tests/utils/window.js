global.setMatchMedia = (value) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    /* deepscan-disable */
    value: jest.fn().mockImplementation((query) => ({
      matches: value,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
    /* deepscan-enable */
  });
};
