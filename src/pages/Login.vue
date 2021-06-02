<template>
  <div class="sm:grid sm:grid-cols-4 md:grid-cols-4 p-2 bp-320:p-4 sm:p-6 md:p-10">
    <!-- main grid with the login functionality -->
    <div class="flex flex-col w-full sm:col-span-full md:col-start-2 md:col-span-2 border shadow-xl bg-white rounded-md p-4 md:p-8 border-primary max-w-3xl mx-auto">
      <!-- plio logo as a banner -->
      <div class="w-20 justify-self-start place-self-center mb-10">
        <img class="h-full w-full object-scale-down" src="@/assets/images/logo.png" />
      </div>
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
          <inline-svg :src="require('@/assets/images/google.svg')" :class="googleButtonIconClass" class="place-self-center"></inline-svg>
          <!-- text -->
          <p :class="googleButtonTitleClass">{{ googleButtonTitle }}</p>
          <!-- loading spinner -->
          <inline-svg v-if="pending" :src="require('@/assets/images/spinner-solid.svg')" class="animate-spin h-4 place-self-center ml-2 md"></inline-svg>
        </div>
      </button>

      <!-- "OR" divider between google login and phone login -->
      <div class="flex flex-row space-x-2">
        <hr class="border-b w-1/2 my-auto border-gray-400" />
        <p class="text-center text-xl sm:text-2xl my-5 whitespace-nowrap">
          {{ $t("login.or") }}
        </p>
        <hr class="border-b w-1/2 my-auto border-gray-400" />
      </div>

      <!-- input box to enter phone number -->
      <input-number
        v-model:value="phoneInput"
        :validation="phoneInputValidation"
        :maxLength="10"
        :staticText="phoneInputStaticText"
        :startIcon="phoneInputIconConfig"
        :placeholder="phoneInputPlaceholder"
      ></input-number>
      <!-- input box to enter OTP -->
      <input-number class="mt-2" v-model:value="otpInput" :validation="otpInputValidation" :maxLength="6" v-if="requestedOtp"></input-number>
      <!-- button to request for OTP -->
      <icon-button
        class="mt-2"
        @click="requestOtp"
        :titleConfig="requestOTPTitleConfig"
        :buttonClass="requestOTPButtonClass"
        v-if="!requestedOtp && isRequestOtpEnabled"
        :isDisabled="!isRequestOtpEnabled"
      ></icon-button>
      <!-- button to submit OTP -->
      <icon-button
        class="mt-2"
        @click="phoneLogin"
        :titleConfig="submitOTPTitleConfig"
        :iconConfig="submitOTPIconConfig"
        :buttonClass="submitOTPButtonClass"
        v-if="requestedOtp"
        :disabled="!isSubmitOTPEnabled || submitOTPIconConfig.enabled"
      ></icon-button>
      <!-- button to request resending OTP -->
      <icon-button
        @click="resendOtp"
        :titleConfig="resendOTPTitleConfig"
        :buttonClass="resendOTPButtonClass"
        class="mt-2"
        :isDisabled="submitOTPIconConfig.enabled"
        v-if="requestedOtp && !resentOtp"
      ></icon-button>
      <!-- text to show when OTP has been resent -->
      <p v-if="resentOtp" class="text-center mt-2">
        {{ $t("login.otp.resent") }}
      </p>

      <!-- terms and service declaration message -->
      <div class="p-2 rounded flex items-start max-w-xl mx-auto mt-4 space-x-1">
        <div class="place-self-center">
          <inline-svg :src="warningIcon" class="fill-current w-4"></inline-svg>
        </div>
        <p v-html="tAndCText" class="text-xs md:text-sm"></p>
      </div>
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
      isSubmitOTPInProgress: false, // whether the OTP has been submitted and is being verified
      phoneInputIconConfig: {
        // icon config for phone input text box
        enabled: true,
        name: "phone-alt-solid",
        class: "text-gray-500 ml-1 p-0.5",
      },
      phoneInputStaticText: {
        // config to show "+91" on the phone input textbox
        enabled: true,
        text: "+91",
        class: "text-gray-500 border-r pr-2",
      },
    };
  },
  computed: {
    ...mapState("sync", ["pending"]),
    tAndCText() {
      return [
        // formatted text for the terms and service opt in message
        this.$t("login.opt_in_t_and_c.1"),
        `<a href='https://plio.in/terms' class="underline" target="_blank">` + this.$t("login.opt_in_t_and_c.2") + `</a>`,
        this.$t("login.opt_in_t_and_c.3"),
        `<a href='https://plio.in/privacy' class="underline" target="_blank">` + this.$t("login.opt_in_t_and_c.4") + `</a>`,
        this.$t("login.opt_in_t_and_c.5"),
      ].join(" ");
    },
    phoneInputPlaceholder() {
      // placeholder to be shown on the phone input textbox
      return this.$t("login.phone.input_placeholder");
    },
    submitOTPIconConfig() {
      // config for the loading icon on the submit otp button
      return {
        enabled: this.isSubmitOTPInProgress,
        iconName: "spinner-solid",
        iconClass: "animate-spin h-4 object-scale-down text-white",
      };
    },
    routeParams() {
      // returns the params for where the user should be directed to
      if (this.redirectTo == "" || this.redirectTo == "/") {
        // there is no other page to redirect the user to
        // redirect to the home page
        return { name: "Home" };
      }
      // redirect to the relevant page with its params
      return { name: this.redirectTo, params: this.redirectParams };
    },
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
    submitOTPTitleConfig() {
      // title config for the submit OTP button
      return {
        value: this.$t("login.otp.submit"),
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
      return "text-gray-600 ml-2 md:text-md text-sm lg:text-xl";
    },
    googleButtonClass() {
      // class for the google sign in button
      return "bg-gray-100 hover:bg-gray-200 ring-gray-200 rounded-md py-6";
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
    // track the event on mixpanel
    this.$mixpanel.track("View Login", {
      "Login Destination": this.routeParams["params"] || {},
    });
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
      this.isSubmitOTPInProgress = true;
      UserAPIService.verifyOtp(this.formattedPhoneInput, this.otpInput)
        .then(response => {
          this.setAccessToken(response.data).then(() => this.routeAfterLogin("phone"));
        })
        .catch(error => {
          this.stopLoading();
          if (error.response.status == 401) {
            // show wrong OTP warning and reset the OTP input text box
            this.invalidOtp = true;
            this.toast.error(this.$t("login.otp.incorrect"));
            this.otpInput = "";
            this.isSubmitOTPInProgress = false;
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
        UserAPIService.convertSocialAuthToken(socialAuthToken.access_token).then(response => {
          this.setAccessToken(response.data).then(() => this.routeAfterLogin("google"));
        });
      } catch (error) {
        this.toast.warning(this.$t("login.google.error"));
        this.stopLoading();
        return null;
      }
    },
    routeAfterLogin(loginType) {
      // fetch the user config and save it locally
      UserConfigService.saveLocalUserConfig().then(() => {
        // update the locale to the local and remote configs
        UserConfigService.updateLocale();
      });
      // route user to the relevant page after login is complete
      this.$router.replace(this.routeParams);
      this.$mixpanel.track("Login", {
        "Login Type": loginType,
        "Login Destination": JSON.stringify(this.routeParams["params"] || {}),
      });
      this.stopLoading();
      this.isSubmitOTPInProgress = false;
    },
  },
};
</script>
<style lang="postcss">
input[type="number"]::-webkit-input-placeholder {
  text-align: left;
}

input[type="number"]:-moz-placeholder {
  /* Firefox 18- */
  text-align: left;
}

input[type="number"]::-moz-placeholder {
  /* Firefox 19+ */
  text-align: left;
}

input[type="number"]:-ms-input-placeholder {
  text-align: left;
}
</style>
