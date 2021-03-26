<template>
  <div class="container">
    <div class="lead_text">
      <p>{{ $t("login.learner.phone_prompt") }}</p>
    </div>
    <input id="phone" v-model="phoneInput" type="tel" maxlength="10" />
    <div class="watch_plio">
      <button id="submit" :disabled="isSubmitDisabled" @click="storePhone">
        {{ $t("login.learner.button") }}
      </button>
    </div>
    <button @click="handleClickSignIn" :disabled="!Vue3GoogleOauth.isInit || Vue3GoogleOauth.isAuthorized">Google sign in</button>
    <user-properties ref="userProperties"></user-properties>
    <!-- <button @click="printConsoleUserInfo">Console User </button> -->
  </div>
</template>

<script>
import UserProperties from "@/services/Config/User.vue";
import UserService from "@/services/API/User.js"
import { mapState, mapActions } from 'vuex'
import { inject, toRefs } from "vue";

export default {
  props: ['id', 'type'],
  components: {
    UserProperties,
  },
  data() {
    return {
      phoneInput: "",
      isSubmitDisabled: true,
      user: '',
    };
  },
  watch: {
    phoneInput: function () {
      let isPhoneValid = this.isPhoneValid();

      if (isPhoneValid) this.isSubmitDisabled = false;
      else this.isSubmitDisabled = true;
    },
  },
  created() {

    if (this.isLoggedIn) {
      this.$router.replace({ name : 'Home'});
    }

    if (this.id) {
      document.getElementById("nav").style.display = "none";
    }
  },
  computed: mapState(['isLoggedIn', 'userId']),
  methods: {
    ...mapActions(['login']),
    storePhone() {
      // this component stores only the user ID in Vuex
      // other aspects of the User like the user Config are pulled
      // separately by other components as needed
      const jsonResponse = JSON.stringify({ userId: this.phoneInput });

      UserService.loginUser(jsonResponse)
      .then((response) => console.log(response))
      .then(() => {
        this.login({
          phone: this.phoneInput,
        })
      })
      .then(() => {
        // set user config locally
        this.$refs.userProperties.saveLocalUserConfigs();

        // set locale from user config
        this.$refs.userProperties.setLocaleFromUserConfig();
      })
      .then(() => {
          if (this.userId != null) {
            if (this.id) {
              if (this.type && this.type == "experiment") {
                // redirect to experiment
                this.$router.replace({ name: 'ABTesting', params: { id: this.id }});
              } else {
                // redirect to plio
                this.$router.replace({ name: 'Player', params:{ id: this.id }});
              }
            } else {
              this.$router.replace({ name : 'Home'});
            }
          }
      });
    },

    isPhoneValid() {
      var num_match = this.phoneInput.toString().match(/^([0]|\+91)?[6-9]\d{9}$/g);

      if (num_match != null) return true;
      return false;
    },

    async handleClickSignIn(){
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        console.log("googleUser", googleUser);
        this.user = googleUser.getBasicProfile().getEmail();
        console.log("getId", this.user);
        console.log("getBasicProfile", googleUser.getBasicProfile());
        console.log("getAuthResponse", googleUser.getAuthResponse());
        console.log(
          "getAuthResponse",
          this.$gAuth.instance.currentUser.get().getAuthResponse()
        );
      } catch (error) {
        //on fail do something
        console.error(error);
        return null;
      }
    },

    // printConsoleUserInfo() {
    //   console.log(this.user);
    // }

  },
  setup(props) {
    const { isSignIn } = toRefs(props);
    const Vue3GoogleOauth = inject("Vue3GoogleOauth");
    const handleClickLogin = () => {};
    return {
      Vue3GoogleOauth,
      handleClickLogin,
      isSignIn,
    };
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
