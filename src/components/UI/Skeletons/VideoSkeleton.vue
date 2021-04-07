<template>
  <div class="border border-primary shadow p-4 m-4">
    <div class="animate-pulse flex flex-col text-primary">
      <div class="flex justify-center">
        <inline-svg
          :src="playIcon"
          class="fill-current text-primary w-1/6 h-1/6 m-10 sm:m-20 lg:m-36 place-self-center"
        ></inline-svg>
      </div>
      <div class="h-4 bg-primary rounded"></div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    playIcon() {
      // fetches and returns the play icon
      return require("@/assets/images/play.svg");
    },
  },
};
</script>
