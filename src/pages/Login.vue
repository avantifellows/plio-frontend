<template>
  <div class="sm:grid sm:grid-cols-4 md:grid-cols-3 p-10">
    <!-- main grid with the login functionality -->
    <div
      class="flex flex-col w-full sm:col-start-2 sm:col-span-2 md:col-start-2 md:col-span-1"
    >
      <!-- prompt to enter phone number -->
      <p class="text-center font-bold text-lg lg:text-xl xl:text-2xl">
        {{ $t("login.phone.prompt") }}
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
      <button
        type="button"
        :class="submitOTPButtonClass"
        class="mt-2 flex justify-center items-center transition ease-in duration-200 text-center text-base font-semibold focus:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!isSubmitOTPEnabled || pending"
        v-if="requestedOtp"
        @click="phoneLogin"
      >
        <div class="flex w-full justify-center">
          <!-- text -->
          <p :class="submitOTPTitleClass">{{ submitOTPTitle }}</p>
          <!-- loading spinner -->
          <inline-svg
            v-if="pending"
            :src="require('@/assets/images/spinner-solid.svg')"
            class="animate-spin h-4 place-self-center ml-2 text-white"
          ></inline-svg>
        </div>
      </button>
      <!-- button to request resending OTP -->
      <icon-button
        @click="resendOtp"
        :titleConfig="resendOTPTitleConfig"
        :buttonClass="resendOTPButtonClass"
        class="mt-2"
        :isDisabled="pending"
        v-if="requestedOtp && !resentOtp"
      ></icon-button>
      <!-- text to show when OTP has been resent -->
      <p v-if="resentOtp" class="text-center mt-2">
        {{ $t("login.otp.resent") }}
      </p>
      <!-- only indian numbers warning message -->
      <div
        class="bg-yellow-50 p-4 rounded flex items-start text-yellow-600 my-4 shadow-lg max-w-xl mx-auto"
      >
        <div class="text-lg place-self-center">
          <inline-svg :src="warningIcon" class="fill-current w-5 pt-1"></inline-svg>
        </div>
        <div class="px-3">
          <p class="pt-2 text-yellow-700">
            {{ $t("login.warning.only_indian_numbers") }}
          </p>
        </div>
      </div>
      <p class="text-center text-2xl sm:text-4xl my-10">{{ $t("login.or") }}</p>
      <!-- google sign in button -->
      <button
        type="button"
        :class="googleButtonClass"
        class="flex justify-center items-center transition ease-in duration-200 text-center text-base font-semibold focus:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isGoogleAuthDisabled"
        @click="googleLogin"
      >
        <div class="flex w-full justify-center">
          <!-- logo -->
          <inline-svg
            :src="require('@/assets/images/google.svg')"
            :class="googleButtonIconClass"
            class="place-self-center"
          ></inline-svg>
          <!-- text -->
          <p :class="googleButtonTitleClass">{{ googleButtonTitle }}</p>
          <!-- loading spinner -->
          <inline-svg
            v-if="pending"
            :src="require('@/assets/images/spinner-solid.svg')"
            class="animate-spin h-4 place-self-center ml-2"
          ></inline-svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import UserAPIService from "@/services/API/User.js";
import UserConfigService from "@/services/Config/User.js";
import InputNumber from "../components/UI/Text/InputNumber.vue";
import IconButton from "../components/UI/Buttons/IconButton.vue";
import { mapActions, mapState } from "vuex";
import { useToast } from "vue-toastification";

// interval to keep checking if google authentication is ready
const GAUTH_VALID_CHECK_INTERVAL = 200;

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
  watch: {
    isRequestOtpEnabled() {
      if (!this.isRequestOtpEnabled) {
        this.requestedOtp = false;
        this.resentOtp = false;
      }
    },
  },
  data() {
    return {
      phoneInput: "", // phone input text
      otpInput: "", // otp input text
      requestedOtp: false, // whether the user has requested OTP once
      resentOtp: false, // whether the user has requested to resend OTP
      invalidOtp: false, // whether the OTP is invalid
      toast: useToast(), // use the toast component
      warningIcon: require("@/assets/images/exclamation-circle-solid.svg"),
      isGoogleAuthDisabled: true, // whether the google auth button is disabled
    };
  },
  computed: {
    ...mapState("sync", ["pending"]),
    redirectParams() {
      // params for the route to be redirected to
      return JSON.parse(this.params);
    },
    phoneInputValidation() {
      // validation config for the phone text input
      return {
        enabled: this.phoneInput,
        isValid: this.isRequestOtpEnabled,
        validMessage: this.$t("login.phone.validation.valid"),
        invalidMessage: this.$t("login.phone.validation.invalid"),
      };
    },
    isOtpValid() {
      // whether the OTP entered by the user is valid
      return this.otpInput.toString().match(/^\d{6}$/g) != null;
    },
    otpInputValidation() {
      // validation config for the otp text input
      return {
        enabled: this.otpInput,
        isValid: this.isSubmitOTPEnabled,
        validMessage: this.$t("login.otp.validation.valid"),
        invalidMessage: this.$t("login.otp.validation.invalid"),
      };
    },
    isRequestOtpEnabled() {
      // whether the user can request for OTP
      return this.phoneInput && this.isPhoneValid();
    },
    isSubmitOTPEnabled() {
      // whether the submit button for OTP is valid
      return this.otpInput && this.isOtpValid;
    },
    formattedPhoneInput() {
      // append default country code
      return "+91" + this.phoneInput;
    },
    requestOTPTitleConfig() {
      // title config for the request OTP button
      return {
        value: this.$t("login.otp.request"),
      };
    },
    requestOTPButtonClass() {
      // class for the request OTP button
      return "bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed ring-primary rounded-md py-2";
    },
    submitOTPTitle() {
      // title for the submit OTP button
      return this.$t("login.otp.submit");
    },
    submitOTPTitleClass() {
      // class of the title for the submit OTP button
      return "text-white";
    },
    submitOTPButtonClass() {
      // class for the submit OTP button
      return "bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ring-green-500 rounded-md py-2";
    },
    resendOTPTitleConfig() {
      // title config for the resend OTP button
      return {
        value: this.$t("login.otp.resend"),
      };
    },
    resendOTPButtonClass() {
      // class for the resend OTP button
      return "bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed ring-primary rounded-md py-2";
    },
    googleButtonIconClass() {
      // class for the icon of the google sign in button
      return "h-5 w-5";
    },
    googleButtonTitle() {
      // title of the google sign in button
      return this.$t("login.google.button");
    },
    googleButtonTitleClass() {
      // class for the title of the google sign in button
      return "text-gray-600 ml-2";
    },
    googleButtonClass() {
      // class for the google sign in button
      return "bg-gray-100 hover:bg-gray-200 ring-gray-200 rounded-md py-4";
    },
  },
  created() {
    // wait for whether the google auth functionality is ready
    var loginInterval = setInterval(() => {
      if (this.$gAuth.instance != null) {
        this.isGoogleAuthDisabled = false;
        clearInterval(loginInterval);
      }
    }, GAUTH_VALID_CHECK_INTERVAL);
  },
  methods: {
    ...mapActions("auth", ["setAccessToken"]),
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    isPhoneValid() {
      // whether the phone number entered by the user is valid
      return this.phoneInput.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g) != null;
    },
    requestOtp() {
      // requests OTP for the first time
      UserAPIService.requestOtp(this.formattedPhoneInput);
      this.requestedOtp = true;
      this.invalidOtp = false;
    },
    resendOtp() {
      // resends OTP on user request
      UserAPIService.requestOtp(this.formattedPhoneInput);
      this.resentOtp = true;
      this.invalidOtp = false;
    },
    phoneLogin() {
      // invoked for logging in with Phone
      this.startLoading();
      UserAPIService.verifyOtp(this.formattedPhoneInput, this.otpInput)
        .then((response) => {
          this.setAccessToken(response.data).then(() => this.routeAfterLogin());
        })
        .catch((error) => {
          this.stopLoading();
          if (error.response.status == 401) {
            // show wrong OTP warning and reset the OTP input text box
            this.invalidOtp = true;
            this.toast.error(this.$t("login.otp.incorrect"));
            this.otpInput = "";
            this.stopLoading();
          }
        });
    },
    async googleLogin() {
      // invoked for logging in with Google
      // check whether Google auth is ready to be used
      try {
        this.startLoading();
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          this.stopLoading();
          return null;
        }
        // set the google login button as disabled
        this.isGoogleAuthDisabled = true;
        let socialAuthToken = googleUser.getAuthResponse();
        UserAPIService.convertSocialAuthToken(socialAuthToken.access_token).then(
          (response) => {
            this.setAccessToken(response.data).then(() => this.routeAfterLogin());
          }
        );
      } catch (error) {
        this.toast.warning(this.$t("login.google.error"));
        this.stopLoading();
        return null;
      }
    },
    routeAfterLogin() {
      // fetch the user config and save it locally
      UserConfigService.saveLocalUserConfig();
      // set the system locale
      UserConfigService.setLocaleFromUserConfig();
      // route user to the relevant page after login is complete
      if (this.redirectTo == "" || this.redirectTo == "/") {
        // there is no other page to redirect the user to
        // redirect to the home page
        this.$router.replace({ name: "Home" });
      } else {
        // redirect to the relevant page with its params
        this.$router.replace({ name: this.redirectTo, params: this.redirectParams });
      }
      this.stopLoading();
    },
  },
};
</script>
