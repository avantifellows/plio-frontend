<template>
  <div class="sm:grid sm:grid-cols-4 md:grid-cols-3 p-10">
    <!-- main grid with the login functionality -->
    <div
      class="flex flex-col w-full sm:col-start-2 sm:col-span-2 md:col-start-2 md:col-span-1"
    >
      <!-- prompt to enter phone number -->
      <p class="text-center font-bold text-lg lg:text-xl xl:text-2xl">
        {{ $t("login.learner.phone_prompt") }}
      </p>
      <!-- input box to enter phone number -->
      <input-number
        class="mt-2"
        v-model:value="phoneInput"
        :validation="phoneInputValidation"
        :maxLength="10"
      ></input-number>
      <!-- input box to enter OTP -->
      <input-number
        class="mt-2"
        v-model:value="otpInput"
        :validation="otpInputValidation"
        :maxLength="6"
        v-if="requestedOtp"
      ></input-number>
      <!-- button to request for OTP -->
      <icon-button
        class="mt-2"
        @click="requestOtp"
        :titleConfig="requestOTPTitleConfig"
        :buttonClass="requestOTPButtonClass"
        v-if="!requestedOtp"
        :isDisabled="!isRequestOtpEnabled"
      ></icon-button>
      <!-- button to submit OTP -->
      <icon-button
        class="mt-2"
        @click="phoneLogin"
        :titleConfig="submitOTPTitleConfig"
        :buttonClass="submitOTPButtonClass"
        v-if="requestedOtp"
        :disabled="!isSubmitOTPEnabled"
      ></icon-button>
      <!-- button to request resending OTP -->
      <icon-button
        @click="resendOtp"
        :titleConfig="resendOTPTitleConfig"
        :buttonClass="resendOTPButtonClass"
        class="mt-2"
        v-if="requestedOtp && !resentOtp"
      ></icon-button>
      <!-- text to show when OTP has been resent -->
      <p v-if="resentOtp" class="text-center mt-2">
        {{ $t("login.learner.message_otp_resent") }}
      </p>
      <p class="text-center text-2xl sm:text-4xl my-10">OR</p>
      <!-- google sign in button -->
      <icon-button
        :iconConfig="googleButtonIconConfig"
        :titleConfig="googleButtonTitleConfig"
        :buttonClass="googleButtonClass"
        @click="googleLogin"
      ></icon-button>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/API/User.js";

import { mapActions } from "vuex";
import InputNumber from "../components/UI/Text/InputNumber.vue";
import IconButton from "../components/UI/Buttons/IconButton.vue";

export default {
  props: {
    redirectTo: {
      // name of the route to redirect to after the login
      type: String,
      default: "",
    },
    params: {
      // params of the route to redirect to after the login
      type: String,
      default: "{}",
    },
  },
  components: {
    InputNumber,
    IconButton,
  },
  data() {
    return {
      phoneInput: "", // phone input text
      otpInput: "", // otp input text
      requestedOtp: false, // whether the user has requested OTP once
      resentOtp: false, // whether the user has requested to resend OTP
      invalidOtp: false, // whether the OTP is invalid
      redirectParams: JSON.parse(this.params), // params for the route to be redirected to
    };
  },
  computed: {
    phoneInputValidation() {
      // validation config for the phone text input
      return {
        enabled: true,
        isValid: this.isRequestOtpEnabled,
        validMessage: "Phone number is valid",
        invalidMessage: "Phone number is invalid",
      };
    },
    otpInputValidation() {
      // validation config for the otp text input
      return {
        enabled: true,
        isValid: this.isSubmitOTPEnabled,
        validMessage: "",
        invalidMessage: "OTP should be 6 digits long",
      };
    },
    isRequestOtpEnabled() {
      // whether the user can request for OTP
      return this.phoneInput && this.isPhoneValid();
    },
    isSubmitOTPEnabled() {
      // whether the submit button for OTP is valid
      return this.otpInput && this.isOtpValid();
    },
    formattedPhoneInput() {
      // append default country code
      return "+91" + this.phoneInput;
    },
    requestOTPTitleConfig() {
      // title config for the request OTP button
      return {
        value: "Request OTP",
      };
    },
    requestOTPButtonClass() {
      // class for the request OTP button
      return "bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed ring-primary rounded-md py-2";
    },
    submitOTPTitleConfig() {
      // title config for the submit OTP button
      return {
        value: "Submit OTP",
        class: "text-white",
      };
    },
    submitOTPButtonClass() {
      // class for the submit OTP button
      return "bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ring-green-500 rounded-md py-2";
    },
    resendOTPTitleConfig() {
      // title config for the resend OTP button
      return {
        value: "Resend OTP",
      };
    },
    resendOTPButtonClass() {
      // class for the resend OTP button
      return "bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed ring-primary rounded-md py-2";
    },
    googleButtonIconConfig() {
      // config for the icon of the google sign in button
      return {
        enabled: true,
        iconName: "google",
        iconClass: "h-5 w-5",
      };
    },
    googleButtonTitleConfig() {
      // config for the title of the google sign in button
      return {
        value: "Sign in with Google",
        class: "text-gray-600 ml-2",
      };
    },
    googleButtonClass() {
      // class for the google sign in button
      return "bg-gray-100 hover:bg-gray-200 ring-gray-200 rounded-md py-4";
    },
  },
  methods: {
    ...mapActions("auth", ["setAccessToken"]),
    isPhoneValid() {
      // whether the phone number entered by the user is valid
      return this.phoneInput.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g) != null;
    },
    isOtpValid() {
      // whether the OTP entered by the user is valid
      return this.otpInput.toString().match(/^\d{6}$/g) != null;
    },
    requestOtp() {
      // requests OTP for the first time
      UserService.requestOtp(this.formattedPhoneInput);
      this.requestedOtp = true;
      this.invalidOtp = false;
    },
    resendOtp() {
      // resends OTP on user request
      UserService.requestOtp(this.formattedPhoneInput);
      this.resentOtp = true;
      this.invalidOtp = false;
    },
    phoneLogin() {
      // invoked for logging in with Phone
      UserService.verifyOtp(this.formattedPhoneInput, this.otpInput)
        .then((response) => {
          this.setAccessToken(response.data).then(() => this.routeAfterLogin());
        })
        .catch((error) => {
          if (error.response.status == 401) {
            this.invalidOtp = true;
          }
        });
    },
    async googleLogin() {
      // invoked for logging in with Google
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        let socialAuthToken = googleUser.getAuthResponse();
        UserService.convertSocialAuthToken(socialAuthToken.access_token).then(
          (response) => {
            this.setAccessToken(response.data).then(() => this.routeAfterLogin());
          }
        );
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    routeAfterLogin() {
      // route user to the relevant page after login is complete
      if (this.redirectTo == "") {
        // there is no other page to redirect the user to
        // redirect to the home page
        this.$router.replace({ name: "Home" });
      } else {
        // redirect to the relevant page with its params
        this.$router.replace({ name: this.redirectTo, params: this.redirectParams });
      }
    },
  },
};
</script>
