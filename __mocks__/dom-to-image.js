export default {
  toBlob: jest.fn(() => {
    return new Promise((resolve) => {
      resolve(new Blob(["test"], { type: "text/plain" }));
    });
  }),
};
