<template>
  <div>
    <!-- title -->
    <div>
      <p class="text-xs pl-2">{{ title }}</p>
    </div>

    <!-- time input boxes  -->
    <div class="flex flex-row space-x-1 pb-2">
      <!-- hour input -->
      <input-text
        v-if="localConfig.showHour"
        :placeholder="'HH'"
        v-model:value="hour"
        class="w-12"
        :maxLength="2"
        :boxStyling="[ defaultBoxClass, hourInputInvalidClass ]"
        :isDisabled="isDisabled"
        v-tooltip.bottom="disabledInputTooltip"
      ></input-text>

      <p class="self-center" v-if="localConfig.showHour && localConfig.showMinute">:</p>

      <!-- minute input -->
      <input-text
        v-if="localConfig.showMinute"
        :placeholder="'MM'"
        v-model:value="minute"
        class="w-12"
        :maxLength="2"
        :boxStyling="[ defaultBoxClass, minuteInputInvalidClass ]"
        :isDisabled="isDisabled"
        v-tooltip.bottom="disabledInputTooltip"
      ></input-text>

      <p class="self-center" v-if="localConfig.showMinute && localConfig.showSecond">:</p>

      <!-- second input -->
      <input-text
        v-if="localConfig.showSecond"
        :placeholder="'SS'"
        v-model:value="second"
        class="w-12"
        :maxLength="2"
        :boxStyling="[ defaultBoxClass, secondInputInvalidClass ]"
        :isDisabled="isDisabled"
        v-tooltip.bottom="disabledInputTooltip"
      ></input-text>

      <p class="self-center" v-if="localConfig.showSecond && localConfig.showMillisecond">:</p>

      <!-- millisecond input -->
      <input-text
        v-if="localConfig.showMillisecond"
        :placeholder="'mmm'"
        v-model:value="millisecond"
        class="w-16"
        :maxLength="3"
        :boxStyling="[ defaultBoxClass, millisecondInputInvalidClass ]"
        :isDisabled="isDisabled"
        v-tooltip.bottom="disabledInputTooltip"
      ></input-text>

    </div>

    <!-- invalid input warning -->
    <div v-if="isAnyInputInvalid" class="flex flex-row pl-2">

      <inline-svg
        :src="require('@/assets/images/times-solid.svg')"
        class="h-5 w-2.5 place-self-center text-red-600"
      ></inline-svg>

      <p class="text-xs pl-2 place-self-center text-red-600">{{ invalidInputWarning }}</p>

    </div>

    <div v-if="timeValid" class="flex flex-row pl-2">

      <inline-svg
        :src="require('@/assets/images/times-solid.svg')"
        class="h-5 w-2.5 place-self-center text-red-600"
      ></inline-svg>

      <p class="text-xs pl-2 place-self-center text-red-600">{{ timeExceedsWarning }}</p>

    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue"

export default {
  data() {
    return {
      defaultConfig: {
        showHour: true,
        showMinute: true,
        showSecond: true,
        showMillisecond: true,
      },

      // to track invalid status of each input separately
      isHourInputInvalid: false,
      isMinuteInputInvalid: false,
      isSecondInputInvalid: false,
      isMillisecondInputInvalid: false,

      // local variables to track and save the local value
      // in case the user enters a character instead of a num
      // as we don't want that string to get updated in main itemlist
      localHour: 0,
      localMinute: 0,
      localSecond: 0,
      localMillisecond: 0,

      invalidInputWarning: "Invalid time value",
      timeExceedsWarning: "The time entered exceeds the video duration",
      disabledInputTooltip: "Cannot edit time in a published plio"
    }
  },
  components: {
    InputText
  },
  props: {
    config: {
      // which box to show can be controlled
      // by default - all 4 boxes will show
      default: function () {
        return {}
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
    timeValid: {
      default: false,
      type: Boolean
    },
    isDisabled: {
      default: false,
      type: Boolean
    }
  },
  methods: {
    isNumeric(value) {
      // if the value contains any non numeric character or not
      return /^\d+$/.test(value)
    },
    checkHourValidity(value) {
      // if hour input is valid or not
      if (!this.isNumeric(value)) {
        return false
      }
      return true
    },
    checkMinuteValidity(value) {
      // if minute input is valid or not
      if (!this.isNumeric(value) || parseInt(value) > 59) {
        return false
      }
      return true
    },
    checkSecondValidity(value) {
      // if second input is valid or not
      if (!this.isNumeric(value) || parseInt(value) > 59) {
        return false
      }
      return true
    },
    checkMillisecondValidity(value) {
      // is millisecond input valid or not
      if (!this.isNumeric(value) || parseInt(value) > 999) {
        return false
      }
      return true
    }
  },
  computed: {
    isAnyInputInvalid() {
      // is any input invalid
      return (
        this.isHourInputInvalid ||
        this.isMinuteInputInvalid ||
        this.isSecondInputInvalid ||
        this.isMillisecondInputInvalid
      )
    },
    defaultBoxClass() {
      // centering the text specifically for time boxes
      return [
        'text-center disabled:opacity-50',
        { 'cursor-not-allowed': this.isDisabled }
      ]
    },
    invalidInputStyle() {
      // show a red border if input is invalid
      return 'border-red-500'
    },
    hourInputInvalidClass() {
      // this style class will be added to the hour input
      // if hour input is invalid
      return this.isHourInputInvalid ? this.invalidInputStyle : undefined
    },
    minuteInputInvalidClass() {
      return this.isMinuteInputInvalid ? this.invalidInputStyle : undefined
    },
    secondInputInvalidClass() {
      return this.isSecondInputInvalid ? this.invalidInputStyle : undefined
    },
    millisecondInputInvalidClass() {
      return this.isMillisecondInputInvalid ? this.invalidInputStyle : undefined
    },
    localConfig() {
      // merges the default config and the config coming
      // as a prop -> places that into "localConfig"
      var localCopy = this.config;
      Object.entries(this.defaultConfig).forEach(([key, val]) => {
        if (!(key in localCopy)) {
          localCopy[key] = val;
        }
      });
      return localCopy;
    },
    localTimeObject() {
      return this.timeObject;
    },
    hour: {
      get() {
        // if invalid, don't use the real prop value but use the
        // locally stored value to show in the textbox
        if (!this.checkHourValidity(this.localHour))
          return this.localHour
        // else use the real prop value
        else return this.localTimeObject.hour;
      },
      set(hour) {
        // save the user's input locally
        this.localHour = hour
        // if valid, emit the value
        if (this.checkHourValidity(hour)) {
          this.isHourInputInvalid = false
          this.localTimeObject.hour = hour;
          this.$emit("update:timeObject", this.localTimeObject);
        }
        // else show invalid input warning
        else this.isHourInputInvalid = true
      },
    },
    minute: {
      get() {
        if (!this.checkMinuteValidity(this.localMinute))
          return this.localMinute
        else return this.localTimeObject.minute;
      },
      set(minute) {
        this.localMinute = minute
        if (this.checkMinuteValidity(minute)){
          this.isMinuteInputInvalid = false
          this.localTimeObject.minute = minute;
          this.$emit("update:timeObject", this.localTimeObject);
        }
        else this.isMinuteInputInvalid = true
      },
    },
    second: {
      get() {
        if (!this.checkSecondValidity(this.localSecond))
          return this.localSecond
        else return this.localTimeObject.second;
      },
      set(second) {
        this.localSecond = second
        if (this.checkSecondValidity(second)){
          this.isSecondInputInvalid = false
          this.localTimeObject.second = second;
          this.$emit("update:timeObject", this.localTimeObject);
        }
        else this.isSecondInputInvalid = true
      },
    },
    millisecond: {
      get() {
        if (!this.checkMillisecondValidity(this.localMillisecond))
          return this.localMillisecond
        else return this.localTimeObject.millisecond;
      },
      set(millisecond) {
        this.localMillisecond = millisecond
        if (this.checkMillisecondValidity(millisecond)){
          this.isMillisecondInputInvalid = false
          this.localTimeObject.millisecond = millisecond;
          this.$emit("update:timeObject", this.localTimeObject);
        }
        else this.isMillisecondInputInvalid = true
      },
    },
  },
  emits: ["update:timeObject"],
};
</script>
