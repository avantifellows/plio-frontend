import { flushPromises, mount } from "@vue/test-utils";
import Login from "@/pages/Login.vue";
import UserAPIService from "@/services/API/User.js";

import { dummyAccessToken, dummyUser } from "@/services/Testing/DummyData.js";

describe("Login.vue", () => {
  it("renders properly with default values", async () => {
    const wrapper = mount(Login);
    expect(wrapper).toBeTruthy();

    // google button should become enabled in a little time
    setTimeout(() => {
      expect(wrapper.vm.isGoogleAuthDisabled).toBe(false);
    }, 500);
  });

  it("activates request otp button for valid phone", async () => {
    const wrapper = mount(Login);

    // request otp button should not be visible at first
    expect(wrapper.find('[data-test="requestOTP"]').exists()).toBe(false);

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");

    expect(wrapper.find('[data-test="requestOTP"]').exists()).toBe(true);
  });

  it("requesting otp activates otp input box", async () => {
    const requestOtp = jest
      .spyOn(UserAPIService, "requestOtp")
      .mockImplementation(() => jest.fn());
    const wrapper = mount(Login);

    // otp input area should not be visible at first
    expect(wrapper.find('[data-test="otp"]').exists()).toBe(false);

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");

    expect(requestOtp).toHaveBeenCalled();
    expect(wrapper.vm.invalidOtp).toBe(false);
    expect(wrapper.vm.requestedOtp).toBe(true);
    expect(wrapper.find('[data-test="otp"]').exists()).toBe(true);
  });

  it("entering valid otp activates submit button", async () => {
    const wrapper = mount(Login);

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");

    // submit otp button should be disabled at first
    expect(wrapper.find('[data-test="submitOTP"]').element.disabled).toBe(true);

    // enter valid otp
    await wrapper
      .find('[data-test="otp"]')
      .find('[data-test="input"]')
      .setValue("123456");

    expect(wrapper.find('[data-test="submitOTP"]').element.disabled).toBe(
      false
    );
  });

  it("entering invalid number after entering a valid number restarts the process", async () => {
    const wrapper = mount(Login);

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");

    // enter invalid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("919191919");

    expect(wrapper.vm.requestedOtp).toBe(false);
    expect(wrapper.vm.resentOtp).toBe(false);
  });

  it("redirects to home after submitting valid OTP", async () => {
    const mockRouter = {
      replace: jest.fn(),
    };
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // mock function to verify OTP
    const verifyOtp = jest
      .spyOn(UserAPIService, "verifyOtp")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyAccessToken });
        });
      });

    // mock function to get user by access token
    const getUserByAccessToken = jest
      .spyOn(UserAPIService, "getUserByAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyUser });
        });
      });

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");
    // enter valid otp
    await wrapper
      .find('[data-test="otp"]')
      .find('[data-test="input"]')
      .setValue("123456");
    // submit otp
    await wrapper.find('[data-test="submitOTP"]').trigger("click");

    await flushPromises();

    expect(verifyOtp).toHaveBeenCalled();
    expect(getUserByAccessToken).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: "Home",
      params: {},
    });
  });

  it("redirects to appropriate page after login", async () => {
    const mockRouter = {
      replace: jest.fn(),
    };
    const wrapper = mount(Login, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
      props: {
        redirectTo: "Editor",
        params: '{"org":"","plioId":"abc"}',
      },
    });

    // mock function to verify OTP
    const verifyOtp = jest
      .spyOn(UserAPIService, "verifyOtp")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyAccessToken });
        });
      });

    // mock function to get user by access token
    const getUserByAccessToken = jest
      .spyOn(UserAPIService, "getUserByAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyUser });
        });
      });

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");
    // enter valid otp
    await wrapper
      .find('[data-test="otp"]')
      .find('[data-test="input"]')
      .setValue("123456");
    // submit otp
    await wrapper.find('[data-test="submitOTP"]').trigger("click");

    await flushPromises();

    expect(verifyOtp).toHaveBeenCalled();
    expect(getUserByAccessToken).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: "Editor",
      params: {
        org: "",
        plioId: "abc",
      },
    });
  });

  it("resends OTP", async () => {
    const wrapper = mount(Login);

    // mock function to verify OTP
    const requestOtp = jest
      .spyOn(UserAPIService, "requestOtp")
      .mockImplementation(() => jest.fn());

    // enter valid number
    await wrapper
      .find('[data-test="phone"]')
      .find('[data-test="input"]')
      .setValue("9191919191");
    // request OTP
    await wrapper.find('[data-test="requestOTP"]').trigger("click");
    // resend OTP
    await wrapper.find('[data-test="resendOTP"]').trigger("click");

    await flushPromises();

    expect(requestOtp).toHaveBeenCalled();
    expect(wrapper.vm.resentOtp).toBe(true);
    expect(wrapper.vm.invalidOtp).toBe(false);
  });

  it("does not log in with Google when null user", async () => {
    const wrapper = mount(Login);

    // google button should become enabled in a little time
    await new Promise((r) => setTimeout(r, 200));

    await wrapper.find('[data-test="googleLogin"]').trigger("click");
    expect(wrapper.vm.isGoogleAuthDisabled).toBe(false);
  });

  it("logs in with Google when valid user returned", async () => {
    // new mock for GAuth which returns a valid user
    const gAuth = {
      signIn: jest.fn(() => {
        return {
          getAuthResponse: jest.fn(() => {
            return dummyAccessToken;
          }),
        };
      }),
      instance: 1,
    };

    const mockRouter = {
      replace: jest.fn(),
    };

    const wrapper = mount(Login, {
      global: {
        mocks: {
          $gAuth: gAuth,
          $router: mockRouter,
        },
      },
    });

    // mock function to convert access token
    const convertSocialAuthToken = jest
      .spyOn(UserAPIService, "convertSocialAuthToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyAccessToken });
        });
      });

    // mock function to get user by access token
    const getUserByAccessToken = jest
      .spyOn(UserAPIService, "getUserByAccessToken")
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve({ data: dummyUser });
        });
      });

    // google button should become enabled in a little time
    await new Promise((r) => setTimeout(r, 200));

    expect(wrapper.vm.isGoogleAuthDisabled).toBe(false);
    await wrapper.find('[data-test="googleLogin"]').trigger("click");

    await flushPromises();

    expect(convertSocialAuthToken).toHaveBeenCalled();
    expect(getUserByAccessToken).toHaveBeenCalled();
    expect(wrapper.vm.isGoogleAuthDisabled).toBe(true);
    expect(mockRouter.replace).toHaveBeenCalledWith({
      name: "Home",
      params: {},
    });
  });
});
