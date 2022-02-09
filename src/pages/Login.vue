<template>
  <div class="sm:grid sm:grid-cols-4 md:grid-cols-7 md:-mt-8 bg-white">
    <!-- main grid with the login functionality -->
    <div
      class="flex flex-col w-full sm:col-span-full md:col-start-2 md:col-span-5 border shadow-xl bg-white rounded-md p-2 bp-420:p-4 lg:px-8 border-primary"
    >
      <!-- plio logo as a banner -->
      <div class="w-full flex flex-col items-center">
        <img
          class="h-full w-8 md:w-10 object-scale-down"
          src="@/assets/images/logo.png"
          height="60"
          width="40"
          alt="Plio logo"
        />

        <p
          class="mt-2 text-center text-md sm:text-xl font-bold text-primary"
          data-test="loginHeading"
        >
          {{ $t("login.heading") }}
        </p>
      </div>

      <div class="grid grid-rows-2 my-4">
        <div class="grid grid-cols-2">
          <div class="bg-gray-100 p-4 lg:p-6 rounded-lg m-1 bp-420:m-2">
            <inline-svg :src="getImageSource('youtube.svg')" class="w-8 h-8"></inline-svg>
            <p :class="subHeadingTitleClass">
              {{ $t("login.sub_headings.interactive.title") }}
            </p>
            <p :class="subHeadingDescriptionClass">
              {{ $t("login.sub_headings.interactive.description") }}
            </p>
          </div>

          <div class="bg-gray-100 p-4 lg:p-6 rounded-lg m-1 bp-420:m-2">
            <inline-svg
              :src="getImageSource('interaction.svg')"
              class="w-8 h-8"
            ></inline-svg>
            <p :class="subHeadingTitleClass">
              {{ $t("login.sub_headings.interactions.title") }}
            </p>
            <p :class="subHeadingDescriptionClass">
              {{ $t("login.sub_headings.interactions.description") }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="bg-gray-100 p-4 lg:p-6 rounded-lg m-1 bp-420:m-2">
            <inline-svg
              :src="getImageSource('download.svg')"
              class="w-8 h-8"
            ></inline-svg>
            <p :class="subHeadingTitleClass">
              {{ $t("login.sub_headings.download.title") }}
            </p>
            <p :class="subHeadingDescriptionClass">
              {{ $t("login.sub_headings.download.description") }}
            </p>
          </div>

          <div class="bg-gray-100 p-4 lg:p-6 rounded-lg m-1 bp-420:m-2">
            <inline-svg
              :src="getImageSource('analytics.svg')"
              class="w-8 h-8"
            ></inline-svg>
            <p :class="subHeadingTitleClass">
              {{ $t("login.sub_headings.analytics.title") }}
            </p>
            <p :class="subHeadingDescriptionClass">
              {{ $t("login.sub_headings.analytics.description") }}
            </p>
          </div>
        </div>
      </div>

      <!-- google sign in button -->
      <button
        type="button"
        :class="googleButtonClass"
        class="flex justify-center items-center transition ease-in duration-200 text-center font-semibold focus:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isGoogleAuthDisabled"
        @click="googleLogin"
        data-test="googleLogin"
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
            class="animate-spin h-4 place-self-center ml-2 md"
          ></inline-svg>
        </div>
      </button>

      <!-- "OR" divider between google login and phone login -->
      <div class="flex flex-row space-x-2">
        <hr class="border-b w-1/2 my-5 border-gray-400" />
        <p class="text-center text-base lg:text-2xl my-2 whitespace-nowrap">
          {{ $t("login.or") }}
        </p>
        <hr class="border-b w-1/2 my-5 border-gray-400" />
      </div>

      <!-- input box to enter phone number -->
      <input-number
        v-model:value="phoneInput"
        containerStyling="border-black border h-12 lg:h-16"
        :validation="phoneInputValidation"
        :maxLength="10"
        :staticText="phoneInputStaticText"
        :startIcon="phoneInputIconConfig"
        :placeholder="phoneInputPlaceholder"
        data-test="phone"
      ></input-number>
      <!-- input box to enter OTP -->
      <input-text
        class="mt-2"
        v-model:value="otpInput"
        :validation="otpInputValidation"
        :maxLength="6"
        inputType="number"
        v-if="requestedOtp"
        data-test="otp"
      ></input-text>
      <!-- button to request for OTP -->
      <icon-button
        class="mt-2"
        @click="requestOtp"
        :titleConfig="requestOTPTitleConfig"
        :buttonClass="requestOTPButtonClass"
        v-if="!requestedOtp && isRequestOtpEnabled"
        :isDisabled="!isRequestOtpEnabled"
        data-test="requestOTP"
      ></icon-button>
      <!-- button to submit OTP -->
      <icon-button
        class="mt-2"
        @click="phoneLogin"
        :titleConfig="submitOTPTitleConfig"
        :iconConfig="submitOTPIconConfig"
        :buttonClass="submitOTPButtonClass"
        v-if="requestedOtp"
        :disabled="!isSubmitOTPEnabled || isSubmitOTPInProgress"
        data-test="submitOTP"
      ></icon-button>
      <!-- button to request resending OTP -->
      <icon-button
        @click="resendOtp"
        :titleConfig="resendOTPTitleConfig"
        :buttonClass="resendOTPButtonClass"
        class="mt-2"
        :isDisabled="isSubmitOTPInProgress || !isResendOTPEnabled"
        v-if="requestedOtp"
        data-test="resendOTP"
      ></icon-button>

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
import InputNumber from "@/components/UI/Text/InputNumber.vue";
import InputText from "@/components/UI/Text/InputText.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { mapActions, mapState } from "vuex";
import { useToast } from "vue-toastification";
import Utilities from "@/services/Functional/Utilities.js";

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
    InputText,
    IconButton,
  },
  watch: {
    isRequestOtpEnabled() {
      if (!this.isRequestOtpEnabled) this.requestedOtp = false;
    },
    requestedOtp()
    {
       if (!this.requestedOtp) clearInterval(this.otpTimerInterval);
    },
  },
  data() {
    return {
      phoneInput: "", // phone input text
      otpInput: "", // otp input text
      resendOTPTimer: 0, // the count of the timer
      otpTimerInterval: 0, // to reset the otp timer
      requestedOtp: false, // whether the user has requested OTP once
      invalidOtp: false, // whether the OTP is invalid
      toast: useToast(),
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
      // classes for the title of each sub-heading
      subHeadingTitleClass: "mt-2 text-sm sm:text-base text-gray-600 font-bold",
      // classes for the description of each sub-heading
      subHeadingDescriptionClass: "mt-2 hidden md:inline text-sm sm:text-base",
    };
  },
  computed: {
    ...mapState("auth", ["user"]),
    ...mapState("sync", ["pending"]),
    tAndCText() {
      return [
        // formatted text for the terms and service opt in message
        this.$t("login.opt_in_t_and_c.1"),
        `<a href='https://plio.in/terms' class="underline" target="_blank" rel="noopener">` +
          this.$t("login.opt_in_t_and_c.2") +
          `</a>`,
        this.$t("login.opt_in_t_and_c.3"),
        `<a href='https://plio.in/privacy' class="underline" target="_blank" rel="noopener">` +
          this.$t("login.opt_in_t_and_c.4") +
          `</a>`,
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
    /**
     * whether the button for resending OTP is enabled
     */
    isResendOTPEnabled() {
      if (!this.resendOTPTimer) return true;
      return false;
    },
    routeParams() {
      // returns the params for where the user should be directed to
      if (this.redirectTo == "" || this.redirectTo == "/") {
        // there is no other page to redirect the user to
        // redirect to the home page
        return { name: "Home", params: {} };
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
      if (!this.isResendOTPEnabled) {
        return {
          value:
            this.$t("login.otp.resend.timer.1") +
            this.resendOTPTimer +
            this.$t("login.otp.resend.timer.2"),
        };
      }
      return {
        value: this.$t("login.otp.resend.no_timer"),
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
      return "text-gray-600 ml-2 text-sm md:text-md lg:text-xl";
    },
    googleButtonClass() {
      // class for the google sign in button
      return "border-black border hover:bg-gray-200 ring-gray-200 rounded-md py-4 lg:py-6";
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
    ...Utilities,
    isPhoneValid() {
      // whether the phone number entered by the user is valid
      return this.phoneInput.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g) != null;
    },
    /**
     *  counts seconds before enabling resend OTP button
     *
     * @param {Number} seconds - the number of seconds for which the timer is to be run
     */
    startResendOTPTimer(seconds = 60) {
      this.resendOTPTimer = seconds;
      this.otpTimerInterval = setInterval(() => {
        this.resendOTPTimer--;
        if (!this.resendOTPTimer) clearInterval(this.otpTimerInterval);
      }, 1000);
    },
    requestOtp() {
      // requests OTP for the first time
      UserAPIService.requestOtp(this.formattedPhoneInput);
      this.requestedOtp = true;
      this.startResendOTPTimer();
      this.otpInput = "";
      this.invalidOtp = false;
    },
    resendOtp() {
      // resends OTP on user request
      UserAPIService.requestOtp(this.formattedPhoneInput);
      this.startResendOTPTimer();
      this.otpInput = "";
      this.invalidOtp = false;
    },
    phoneLogin() {
      // invoked for logging in with Phone
      this.isSubmitOTPInProgress = true;
      UserAPIService.verifyOtp(this.formattedPhoneInput, this.otpInput)
        .then((response) => {
          this.setAccessToken(response.data).then(() => this.routeAfterLogin("phone"));
        })
        .catch((error) => {
          this.stopLoading();
          if (error.response.status == 401) {
            // show wrong OTP warning and reset the OTP input text box
            this.invalidOtp = true;
            this.toast.error(this.$t("toast.login.otp.incorrect"));
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
        UserAPIService.convertSocialAuthToken(socialAuthToken.access_token).then(
          (response) => {
            this.setAccessToken(response.data).then(() => this.routeAfterLogin("google"));
          }
        );
      } catch (error) {
        this.toast.warning(this.$t("toast.login.google.error"));
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
      this.$mixpanel.register({
        "User Status": this.user.status,
        "Current Workspace": this.routeParams.params.org || "",
      });
      this.$mixpanel.track("Login", {
        "Login Type": loginType,
        "Login Destination": JSON.stringify(this.routeParams["params"] || {}),
      });
      this.$mixpanel.people.set_once({
        "First Log In": new Date().toISOString(),
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
