<template>
  <div>
    <div>
      <p class="text-xs pl-2">{{ title }}</p>
    </div>
    <div class="flex flex-row space-x-1">
      <!-- hour input -->
      <input-text
        v-if="config.showHour"
        :placeholder="'HH'"
        v-model:value="hour"
        class="w-12"
        :type="{ boxType: 'input', inputType: 'number' }"
        :min="0"
        :max="23"
      ></input-text>

      <p class="self-center" v-if="config.showHour && config.showMinute">:</p>

      <!-- minute input -->
      <input-text
        v-if="config.showMinute"
        :placeholder="'MM'"
        v-model:value="minute"
        class="w-12"
        :type="{ boxType: 'input', inputType: 'number' }"
        :min="0"
        :max="59"
      ></input-text>

      <p class="self-center" v-if="config.showMinute && config.showSecond">:</p>

      <!-- second input -->
      <input-text
        v-if="config.showSecond"
        :placeholder="'SS'"
        v-model:value="second"
        class="w-12"
        :type="{ boxType: 'input', inputType: 'number' }"
        :min="0"
        :max="59"
      ></input-text>

      <p class="self-center" v-if="config.showSecond && config.showMillisecond">:</p>

      <!-- millisecond input -->
      <input-text
        v-if="config.showMillisecond"
        :placeholder="'mmm'"
        v-model:value="millisecond"
        class="w-16"
        :type="{ boxType: 'input', inputType: 'number' }"
        :min="0"
        :max="999"
      ></input-text>
    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";

export default {
  components: {
    InputText,
  },
  props: {
    config: {
      // which box to show can be controled
      // by default - all 4 boxes will show
      default: function () {
        return {
          showHour: true,
          showMinute: true,
          showSecond: true,
          showMillisecond: true,
        };
      },
      type: Object,
    },
    title: {
      default: "",
      type: String,
    },
    timeObject: {
      // the object containing keys with values
      // 'hour', 'minute', 'second', 'millisecond'
      default: function () {
        return {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        };
      },
      type: Object,
    },
  },
  computed: {
    localTimeObject() {
      return this.timeObject;
    },
    hour: {
      get() {
        return this.localTimeObject.hour;
      },
      set(hour) {
        this.localTimeObject.hour = hour;
        this.$emit("update:timeObject", this.localTimeObject);
      },
    },
    minute: {
      get() {
        return this.localTimeObject.minute;
      },
      set(minute) {
        this.localTimeObject.minute = minute;
        this.$emit("update:timeObject", this.localTimeObject);
      },
    },
    second: {
      get() {
        return this.localTimeObject.second;
      },
      set(second) {
        this.localTimeObject.second = second;
        this.$emit("update:timeObject", this.localTimeObject);
      },
    },
    millisecond: {
      get() {
        return this.localTimeObject.millisecond;
      },
      set(millisecond) {
        this.localTimeObject.millisecond = millisecond;
        this.$emit("update:timeObject", this.localTimeObject);
      },
    },
  },
  emits: ["update:timeObject"],
};
</script>
