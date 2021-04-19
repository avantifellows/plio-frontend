<template>
  <div>
    <div v-if="!isUserApproved" class="flex flex-col w-full h-full mt-10">
      <div class="flex justify-center">
        <inline-svg
          :src="confirmIcon"
          class="h-12 w-12 sm:h-20 sm:w-20 place-self-center text-green-600"
        ></inline-svg>
      </div>
      <div class="mt-10">
        <p class="text-center text-lg sm:text-2xl">
          You have been added to the waitlist <br />
          You will hear from us soon
        </p>
      </div>
    </div>
    <PlioList v-else />
  </div>
</template>

<script>
import PlioList from "@/components/UI/PlioList.vue";
import { mapState } from "vuex";

export default {
  name: "Home",
  components: {
    PlioList,
  },
  data() {
    return {
      confirmIcon: require("@/assets/images/check-circle-regular.svg"),
    };
  },
  computed: {
    ...mapState("auth", ["user"]),
    isUserApproved() {
      // whether the user is an approved user or in waitlist
      return this.user.status == "approved";
    },
  },
};
</script>
