<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <div class="grid md:grid-cols-3 grid-cols-1">
      <div class="flex flex-col col-start-2">
        <div class="text-center text-lg font-bold">
          Hooray! Congratulations on completing the Plio!
        </div>
        <CircularProgress
          class=""
          :radius="100"
          :progress="40"
          :stroke="8"
        ></CircularProgress>
        <div class="flex flex-row justify-between">
          <div class="h-16 w-16 rounded-md bg-yellow-500 grid grid-rows-3 border-2">
            <div class="row-span-2 w-full h-full flex flex-row justify-around">
              <inline-svg
                :src="getIconSource('check-circle-regular.svg')"
                class="w-6 h-6 place-self-center text-green-500"
              ></inline-svg>
              <p class="text-2xl font-bold my-auto">3</p>
            </div>
            <div class="text-center">Correct</div>
          </div>
          <div class="h-16 w-16 rounded-md bg-yellow-500 grid grid-rows-3 border-2">
            <div class="row-span-2 w-full h-full flex flex-row justify-around">
              <inline-svg
                :src="getIconSource('check-circle-regular.svg')"
                class="w-6 h-6 place-self-center text-green-500"
              ></inline-svg>
              <p class="text-2xl font-bold my-auto">3</p>
            </div>
            <div class="text-center">Correct</div>
          </div>
          <div class="h-16 w-16 rounded-md bg-yellow-500 grid grid-rows-3 border-2">
            <div class="row-span-2 w-full h-full flex flex-row justify-around">
              <inline-svg
                :src="getIconSource('check-circle-regular.svg')"
                class="w-6 h-6 place-self-center text-green-500"
              ></inline-svg>
              <p class="text-2xl font-bold my-auto">3</p>
            </div>
            <div class="text-center">Correct</div>
          </div>
          <div class="h-16 w-16 rounded-md bg-yellow-500 grid grid-rows-3 border-2">
            <div class="row-span-2 w-full h-full flex flex-row justify-around">
              <inline-svg
                :src="getIconSource('check-circle-regular.svg')"
                class="w-6 h-6 place-self-center text-green-500"
              ></inline-svg>
              <p class="text-2xl font-bold my-auto">3</p>
            </div>
            <div class="text-center">Correct</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CircularProgress from "@/components/UI/Progress/CircularProgress.vue";
import Utilties from "@/services/Functional/Utilities.js";

export default {
  name: "ScorecardBody",
  components: {
    CircularProgress,
  },
  props: {},
  data() {
    return {};
  },
  computed: {},
  methods: {
    ...Utilties,
  },
};
</script>

<style lang="postcss"></style>
