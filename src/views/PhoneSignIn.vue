<template>
  <div class="container">
    <div class="lead_text">
      <p>कृपया अपना मोबाइल नंबर डालें</p>
      <p>Please enter your mobile number (10 digits only)</p>
    </div>
    <input id="phone" v-model="phone_input" type="phone" maxlength="10" />
    <div class="watch_plio">
      <button id="submit" :disabled="isSubmitDisabled" @click="storePhone">
        Watch Plio!
      </button>
    </div>
  </div>
</template>

<script>
import PhoneNumber from "awesome-phonenumber";

export default {
  data() {
    return {
      phone_input: "",
      isSubmitDisabled: true,
    };
  },
  watch: {
    phone_input: function () {
      let phone = PhoneNumber(this.phone_input.toString(), "IN");
      if (!phone.isValid()) {
        this.isSubmitDisabled = true;
      } else {
        this.isSubmitDisabled = false;
      }
    },
  },
  created() {
      if (this.isLoggedIn) {
        this.$router.push('/')
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },
  methods: {
    storePhone() {
      this.$store
        .dispatch("login", {
          phone: this.phone_input,
        })
        .then(() => {
          if (this.$route.params.id) {
            this.$router.push( {path: "/play/" + this.$route.params.id})
          } else {
            this.$router.push({ path: "/" });
          }
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