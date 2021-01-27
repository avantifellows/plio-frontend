<template>
  <div class="container">
    <div class="lead_text">
      <p>कृपया अपना मोबाइल नंबर डालें</p>
      <p>Please enter your mobile number (10 digits only)</p>
    </div>
    <input id="phone" v-model="phone_input" type="tel" maxlength="10" />
    <div class="watch_plio">
      <button id="submit" :disabled="isSubmitDisabled" @click="storePhone">
        Watch Plio!
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      phone_input: "",
      isSubmitDisabled: true,
    };
  },
  watch: {
    phone_input: function () {
      let isPhoneValid = this.isPhoneValid();

      if (isPhoneValid) this.isSubmitDisabled = false;
      else this.isSubmitDisabled = true;
    },
  },
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
    storePhone() {
      // this component stores only the user ID in Vuex
      // other aspects of the User like the user Config are pulled
      // separately by other components as needed
      // TODO: a separate UserConfig component to initialize the user
      // for everyone
      const json_response = JSON.stringify({ userId: this.phone_input });

      fetch(process.env.VUE_APP_BACKEND + process.env.VUE_APP_BACKEND_LOGIN_USER, {
        method: "POST",
        body: json_response,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(() => {
          this.$store.dispatch("login", {
            phone: this.phone_input,
          });
        })
        .then(() => {
          var redirectId = setInterval(() => {
            if (localStorage.phone != null) {
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

    isPhoneValid() {
      var num_match = this.phone_input.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g);

      if (num_match != null) return true;
      return false;
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
