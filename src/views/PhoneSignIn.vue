<template>
  <div class="container">
    <div class="lead_text">
      <p>{{ $t("login.learner.phone_prompt") }}</p>
    </div>
    <vue-tel-input
      v-bind="bindProps"
      @validate="validate"
      @keypress="isNumber($event)"
    ></vue-tel-input>
    <!-- <input id="phone" v-model="phoneInput" type="tel" maxlength="10" /> -->
    <div class="watch_plio">
      <button id="submit" :disabled="isSubmitDisabled" @click="storePhone">
        {{ $t("login.learner.button") }}
      </button>
    </div>
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import UserProperties from "../components/UserProperties.vue";
import { VueTelInput } from "vue3-tel-input";
import "vue3-tel-input/dist/vue3-tel-input.css";

export default {
  components: {
    UserProperties,
    VueTelInput,
  },
  data() {
    return {
      phoneInput: "",
      isSubmitDisabled: true,
      bindProps: {
        mode: "auto",
        autoFormat: false,
        placeholder: "",
        required: true,
        preferredCountries: ["IN", "US"],
        name: "telephone",
        // validCharactersOnly: true,
        inputOptions: {
          showDialCode: false,
          invalidMsg: "ddd",
          type: "tel",
          maxlength: 13,
        },
      },
    };
  },
  // watch: {
  //   phoneInput() {
  //     let isPhoneValid = this.isPhoneValid();

  //     if (isPhoneValid) this.isSubmitDisabled = false;
  //     else this.isSubmitDisabled = true;
  //   },
  // },
  created() {
    if (this.isLoggedIn) {
      this.$router.push("/");
    }

    if (this.$route.params.id) {
      document.getElementById("nav").style.display = "none";
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
  },
  methods: {
    isNumber: function (event) {
      event = event ? event : window.event;
      var charCode = event.which ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        event.preventDefault();
      } else {
        return true;
      }
    },

    validate(phoneObject) {
      if (phoneObject.valid) {
        this.isSubmitDisabled = false;
        this.phoneInput = phoneObject.countryCallingCode + phoneObject.nationalNumber;
        console.log(this.phoneInput);
      } else this.isSubmitDisabled = true;
    },

    storePhone() {
      // this component stores only the user ID in Vuex
      // other aspects of the User like the user Config are pulled
      // separately by other components as needed
      const jsonResponse = JSON.stringify({ userId: this.phoneInput });

      fetch(process.env.VUE_APP_BACKEND + process.env.VUE_APP_BACKEND_LOGIN_USER, {
        method: "POST",
        body: jsonResponse,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(() => {
          this.$store.dispatch("login", {
            phone: this.phoneInput,
          });
        })
        .then(() => {
          // set user config locally
          this.$refs.userProperties.saveLocalUserConfigs();

          // set locale from user config
          this.$refs.userProperties.setLocaleFromUserConfig();
        })
        .then(() => {
          var redirectId = setInterval(() => {
            if (this.$store.getters.getUserId != null) {
              if (this.$route.params.id) {
                if (this.$route.params.type && this.$route.params.type == "experiment") {
                  // redirect to experiment
                  this.$router.push({ path: "/experiment/" + this.$route.params.id });
                } else {
                  // redirect to plio
                  this.$router.push({ path: "/play/" + this.$route.params.id });
                }
              } else {
                this.$router.push({ path: "/" });
              }
              clearInterval(redirectId);
            }
          }, 500);
        });
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

#phone {
  margin: auto;
  max-width: 300px;
  font-size: 1.6em;
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
  margin: 32px 2px;
  cursor: pointer;
}

button:disabled {
  background-color: grey;
}

button:disabled:hover {
  cursor: pointer;
}
</style>
