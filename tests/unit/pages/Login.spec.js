import { flushPromises, mount } from "@vue/test-utils";
import Login from "@/pages/Login.vue";
import UserAPIService from "@/services/API/User.js";

describe("Login.vue", () => {
  let wrapper;

  const mountWrapper = (params = { global: {} }) => {
    wrapper = mount(Login, {
      global: params.global,
    });
  };

  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => mountWrapper());

  it("renders properly with default values", async () => {
    expect(wrapper).toBeTruthy();
  });

  it("option to request otp is not visible by default", () => {
    // request otp button should not be visible
    expect(wrapper.find('[data-test="requestOTP"]').exists()).toBe(false);
  });

  describe("login with phone", () => {
    const setPhoneNumber = async () => {
      // enter valid number
      await wrapper
        .find('[data-test="phone"]')
        .find('[data-test="input"]')
        .setValue("9191919191");
    };

    beforeEach(async () => await setPhoneNumber());

    it("activates request otp button for valid phone", async () => {
      expect(wrapper.find('[data-test="requestOTP"]').exists()).toBe(true);
    });

    describe("requesting otp", () => {
      const requestOTP = async () => {
        // request OTP
        await wrapper.find('[data-test="requestOTP"]').trigger("click");
      };

      beforeEach(async () => await requestOTP());

      it("requesting otp activates otp input box", async () => {
        const requestOtp = jest
          .spyOn(UserAPIService, "requestOtp")
          .mockImplementation(() => jest.fn());
        mountWrapper();
        await setPhoneNumber();
        await requestOTP();

        expect(requestOtp).toHaveBeenCalled();
        expect(wrapper.vm.invalidOtp).toBe(false);
        expect(wrapper.vm.requestedOtp).toBe(true);
        expect(wrapper.find('[data-test="otp"]').exists()).toBe(true);
      });

      it("entering valid otp activates submit button", async () => {
        // submit otp button should be disabled at first
        expect(wrapper.find('[data-test="submitOTP"]').element.disabled).toBe(
          true
        );

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
        // enter invalid number
        await wrapper
          .find('[data-test="phone"]')
          .find('[data-test="input"]')
          .setValue("919191919");

        expect(wrapper.vm.requestedOtp).toBe(false);
      });

      it("resends OTP upon requesting", async () => {
        // mock function to verify OTP
        const requestOtp = jest
          .spyOn(UserAPIService, "requestOtp")
          .mockImplementation(() => jest.fn());
        const startResendOTPTimer = jest.spyOn(
          Login.methods,
          "startResendOTPTimer"
        );
        mountWrapper();

        await setPhoneNumber();
        await requestOTP();

        // resend OTP
        await wrapper.find('[data-test="resendOTP"]').trigger("click");

        await flushPromises();

        expect(requestOtp).toHaveBeenCalled();
        expect(startResendOTPTimer).toHaveBeenCalled();
        expect(wrapper.vm.resendOTPTimer).toBe(60);
        expect(wrapper.vm.isResendOTPEnabled).toBe(false);
        expect(wrapper.vm.invalidOtp).toBe(false);
      });

      it("enables ResendOTP button when timer ends", async () => {
        //Faketimer is only needed for this test case to advance the time of interval
        jest.useFakeTimers();
        const numseconds = 2;
        wrapper.vm.startResendOTPTimer(numseconds);
        jest.advanceTimersByTime(numseconds * 1000);
        expect(wrapper.vm.isResendOTPEnabled).toBe(true);
        expect(wrapper.vm.resendOTPTimer).toBe(0);
        // reset timers
        jest.useRealTimers();
      });

      describe("submit valid otp", () => {
        let verifyOtp;
        let getUserByAccessToken;

        beforeEach(async () => {
          // mock function to verify OTP
          verifyOtp = jest
            .spyOn(UserAPIService, "verifyOtp")
            .mockImplementation(() => {
              return new Promise((resolve) => {
                resolve({ data: global.dummyAccessToken });
              });
            });

          // mock function to get user by access token
          getUserByAccessToken = jest
            .spyOn(UserAPIService, "getUserByAccessToken")
            .mockImplementation(() => {
              return new Promise((resolve) => {
                resolve({ data: global.dummyUser });
              });
            });

          mountWrapper({
            global: {
              mocks: {
                $router: mockRouter,
              },
            },
          });
          await setPhoneNumber();
          await requestOTP();

          // enter valid otp
          await wrapper
            .find('[data-test="otp"]')
            .find('[data-test="input"]')
            .setValue("123456");
        });

        it("redirects to home after submitting valid OTP", async () => {
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
          await wrapper.setProps({
            redirectTo: "Editor",
            params: '{"org":"","plioId":"abc"}',
          });

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
      });
    });
  });

  describe("login with google", () => {
    it("google auth button becomes enabled after a little time", async () => {
      // google button should become enabled in a little time
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(wrapper.vm.isGoogleAuthDisabled).toBe(false);
    });

    it("logs in with Google when valid user returned", async () => {
      // new mock for GAuth which returns a valid user
      const gAuth = {
        signIn: jest.fn(() => {
          return {
            getAuthResponse: jest.fn(() => {
              return global.dummyAccessToken;
            }),
          };
        }),
        instance: 1,
      };

      // mock function to convert access token
      const convertSocialAuthToken = jest
        .spyOn(UserAPIService, "convertSocialAuthToken")
        .mockImplementation(() => {
          return new Promise((resolve) => {
            resolve({ data: global.dummyAccessToken });
          });
        });

      // mock function to get user by access token
      const getUserByAccessToken = jest
        .spyOn(UserAPIService, "getUserByAccessToken")
        .mockImplementation(() => {
          return new Promise((resolve) => {
            resolve({ data: global.dummyUser });
          });
        });

      await mountWrapper({
        global: {
          mocks: {
            $gAuth: gAuth,
            $router: mockRouter,
          },
        },
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
});
