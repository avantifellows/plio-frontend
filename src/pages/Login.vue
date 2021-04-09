<template>
  <div class="container">
    <div class="lead_text">
      <p>{{ $t("login.learner.phone_prompt") }}</p>
    </div>
    <div class="mb-2">
      <input id="phone" class="form-control" v-model="phoneInput" type="tel" maxlength="10" />
    </div>
    <div class="form-group">
      <input id="otp" :class="{'is-invalid': invalidOtp}" class="form-control" v-model="otpInput" type="text" maxlength="6" v-if="requestedOtp" />
      <small class="text-bold message-otp-invalid" v-if="invalidOtp">
        {{ $t("login.learner.message_otp_invalid") }}
      </small>
    </div>
    <div class="watch_plio mb-5">
      <button class="my-4" :disabled="isOtpSubmitDisabled" @click="requestOtp" v-if="!requestedOtp">
        {{ $t("login.learner.button_otp") }}
      </button>
      <button class="mt-4" id="submit" :disabled="isSubmitDisabled" @click="login" v-if="requestedOtp">
        {{ $t("login.learner.button_submit") }}
      </button>
      <div class="mt-1 resend-otp" v-if="requestedOtp && !resentOtp" @click="resendOtp">
        {{ $t("login.learner.button_resend") }}
      </div>
      <div class="mt-1 message-otp-resent" v-if="resentOtp">
        {{ $t("login.learner.message_otp_resent") }}
      </div>
    </div>
    <button class="my-5 g-sign-in" @click="handleClickGoogleSignIn">
        <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><title>Google</title><g fill="none" fill-rule="evenodd"><path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"></path><path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"></path><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z"></path><path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z"></path></g></svg></span>
        <span>&nbsp;&nbsp;{{ $t("login.learner.button_google_sign_in") }}</span>
    </button>
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import UserProperties from "@/services/Config/User.vue";
import UserService from "@/services/API/User.js";

import { mapState, mapActions } from "vuex";

export default {
  props: ["id", "type"],
  components: {
    UserProperties,
  },
  data() {
    return {
      phoneInput: "",
      otpInput: "",
      requestedOtp: false,
      resentOtp: false,
      invalidOtp: false,
    };
  },
  computed: {
    ...mapState('auth', ["userId"]),
    isOtpSubmitDisabled: function () {
      if (!this.phoneInput) return true;
      return this.phoneInput.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g) == null;
    },
    isSubmitDisabled: function () {
      if (!this.otpInput) return true;
      return this.otpInput.toString().match(/^\d{6}$/g) == null;
    },
    formattedPhoneInput: function () {
      return '+91' + this.phoneInput;
    },
  },
  methods: {
    ...mapActions('auth', ['setAccessToken']),
    requestOtp() {
      UserService.requestOtp(this.formattedPhoneInput).then((response) => console.log(response));
      this.requestedOtp = true;
      this.invalidOtp = false;
    },
    resendOtp() {
      UserService.requestOtp(this.formattedPhoneInput).then((response) => console.log(response));
      this.resentOtp = true;
      this.invalidOtp = false;
    },
    login() {
      UserService.verifyOtp(this.formattedPhoneInput, this.otpInput)
        .then((response) => {
          this.setAccessToken(response.data);
          this.$router.push({name: 'Home'});
        }).catch((error) => {
          if (error.response.status == 401) {
            this.invalidOtp = true;
          }
        });
    },
    async handleClickGoogleSignIn(){
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        let socialAuthToken = googleUser.getAuthResponse();
        UserService.convertSocialAuthToken(socialAuthToken.access_token).then((response) => {
          this.setAccessToken(response.data);
          this.$router.push({name: 'Home'});
        });
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  },
};
</script>

<style scoped>
.lead_text {
  font-size: 1.6em;
  font-weight: bold;
}

.container {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.form-group {
  display: flex;
  flex-direction: column;
}

input.form-control {
  max-width: 300px;
  font-size: 1.6em;
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 8px 10px;
}

input.form-control.is-invalid {
  border-color: red;
}

button {
  background-color: #df7c3a;
  border: none;
  color: white;
  padding: 10px 32px;
  text-align: center;
  border-radius: 5px;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

button.g-sign-in {
    border: 1px solid #df7c3a;
    background-color: white;
    color: #df7c3a;
    outline: none;
}

button.g-sign-in:hover {
    background-color: #df7c3a;
    color: white;
}

button:disabled {
  background-color: grey;
}

button:disabled:hover {
  cursor: pointer;
}
.resend-otp {
  color: #df7c3a;
  cursor: pointer;
  text-decoration: underline;
}
.message-otp-resent {
  color: green;
}
.message-otp-invalid {
  color: red;
  font-weight: bold;
}
</style>
