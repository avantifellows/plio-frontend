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
        :boxStyling="[defaultBoxClass, hourInputInvalidClass]"
        :isDisabled="isDisabled"
        v-tooltip="inputTooltip"
        data-test="hour"
      ></input-text>

      <p class="self-center" v-if="localConfig.showHour && localConfig.showMinute">:</p>

      <!-- minute input -->
      <input-text
        v-if="localConfig.showMinute"
        :placeholder="'MM'"
        v-model:value="minute"
        class="w-12"
        :maxLength="2"
        :boxStyling="[defaultBoxClass, minuteInputInvalidClass]"
        :isDisabled="isDisabled"
        v-tooltip="inputTooltip"
        data-test="minute"
      ></input-text>

      <p class="self-center" v-if="localConfig.showMinute && localConfig.showSecond">:</p>

      <!-- second input -->
      <input-text
        v-if="localConfig.showSecond"
        :placeholder="'SS'"
        v-model:value="second"
        class="w-12"
        :maxLength="2"
        :boxStyling="[defaultBoxClass, secondInputInvalidClass]"
        :isDisabled="isDisabled"
        v-tooltip="inputTooltip"
        data-test="second"
      ></input-text>

      <p class="self-center" v-if="localConfig.showSecond && localConfig.showMillisecond">
        :
      </p>

      <!-- millisecond input -->
      <input-text
        v-if="localConfig.showMillisecond"
        :placeholder="'mmm'"
        v-model:value="millisecond"
        class="w-16"
        :maxLength="3"
        :boxStyling="[defaultBoxClass, millisecondInputInvalidClass]"
        :isDisabled="isDisabled"
        v-tooltip="inputTooltip"
        data-test="millisecond"
      ></input-text>
    </div>

    <!-- invalid input warning -->
    <div v-for="(isErrorActive, errorMessage) in preparedErrorStates" :key="errorMessage">
      <div v-if="isErrorActive" class="flex flex-row pl-2">
        <inline-svg
          :src="require('@/assets/images/times-solid.svg')"
          class="h-5 w-2.5 place-self-center text-red-600"
        ></inline-svg>
        <p class="text-xs pl-2 place-self-center text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";

export default {
  data() {
    return {
      defaultConfig: {
        showHour: this.timeObject.hour != 0, // don't show the hour part if the value is 0
        showMinute: true,
        showSecond: true,
        showMillisecond: true,
      },

      // to track valid status of each input separately
      isHourInputValid: true,
      isMinuteInputValid: true,
      isSecondInputValid: true,
      isMillisecondInputValid: true,

      // local variables to track and save the local value
      // in case the user enters a character instead of a num
      // as we don't want that string to get updated in main itemlist
      localHour: 0,
      localMinute: 0,
      localSecond: 0,
      localMillisecond: 0,

      // warning messages for different kind of error states
      hourInputInvalidWarning: "Hour input is invalid",
      minuteInputInvalidWarning: "Minute input is invalid",
      secondInputInvalidWarning: "Second input is invalid",
      milliSecondInputInvalidWarning: "Millisecond input is invalid",

      // these flags are to keep track of whether the changes to the
      // time values is because of an external change (eg - marker dragging)
      // or because of an internal change (eg - updating the timeinput box values)
      isInternalChange: false,
      isExternalChange: false,
    };
  },
  components: {
    InputText,
  },
  props: {
    /**
     * which box to show can be controlled;
     * by default - all 4 boxes (corresponding to hour, minute, second and millisecond) will show
     */
    config: {
      default: function () {
        return {};
      },
      type: Object,
    },
    title: {
      default: "",
      type: String,
    },
    /**
     * the object containing keys with values: 'hour', 'minute', 'second', 'millisecond'
     */
    timeObject: {
      default: () => {
        return {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        };
      },
      type: Object,
    },
    /** error states passed from the parent component */
    errorStates: {
      default: () => {},
      type: Object,
    },
    /** whether to disable the time inputs */
    isDisabled: {
      default: false,
      type: Boolean,
    },
    /** tooltip to be used when this component is disabled */
    disabledTooltip: {
      default: "",
      type: String,
    },
  },
  watch: {
    // if any error states change (occur or resolve), check for them
    // make the appropriate emits
    preparedErrorStates: {
      handler() {
        this.checkForErrors();
      },
      deep: true,
    },
    isExternalChange(value) {
      // track whenever there is an external change that is causing the timeinput
      // values to change. If the change is external, reset the local values to the ones
      // coming from the prop
      if (value) {
        this.localHour = this.timeObject.hour;
        this.localMinute = this.timeObject.minute;
        this.localSecond = this.timeObject.second;
        this.localMillisecond = this.timeObject.millisecond;
      }
    },
    timeObject: {
      handler() {
        // update the local values if the timeObject prop gets updated
        this.localHour = this.timeObject.hour;
        this.localMinute = this.timeObject.minute;
        this.localSecond = this.timeObject.second;
        this.localMillisecond = this.timeObject.millisecond;
        // update whether to show the hour value
        this.localConfig.showHour = this.localHour == 0 ? false : true;
      },
      deep: true,
    },
  },
  methods: {
    isNumeric(value) {
      // if the value contains any non numeric character or not
      return /^\d+$/.test(value);
    },
    checkHourValidity(value) {
      // check if value is valid or not and return that

      return (this.isHourInputValid = !this.isNumeric(value) ? false : true);
    },
    checkMinuteValidity(value) {
      // check if value is valid or not and return that

      return (this.isMinuteInputValid =
        this.isNumeric(value) && parseInt(value) < 60 ? true : false);
    },
    checkSecondValidity(value) {
      // check if value is valid or not and return that

      return (this.isSecondInputValid =
        this.isNumeric(value) && parseInt(value) < 60 ? true : false);
    },
    checkMillisecondValidity(value) {
      // check if value is valid or not and return that

      return (this.isMillisecondInputValid =
        this.isNumeric(value) && parseInt(value) < 1000 ? true : false);
    },
    checkForErrors() {
      // iterate through all error states - if even one error is found active
      // emit - an error occurred, else emit - error resolved

      // eslint-disable-next-line no-unused-vars
      for (const [_, isActive] of Object.entries(this.preparedErrorStates)) {
        if (isActive) {
          this.$emit("error-occurred");
          return;
        }
      }
      this.$emit("error-resolved");
      return;
    },
    setChangeAsExternal() {
      // to track that the change to the timeinput values
      // is external and NOT internal
      this.isInternalChange = false;
      this.isExternalChange = true;
    },
    setChangeAsInternal() {
      // to track that the change to the timeinput values
      // is internal and NOT external
      this.isInternalChange = true;
      this.isExternalChange = false;
    },
  },
  computed: {
    preparedErrorStates() {
      // prepare error state object by merging local error states and the error
      // states coming in as props from the parent component
      var localErrorStates = {};
      localErrorStates[this.hourInputInvalidWarning] = !this.isHourInputValid;
      localErrorStates[this.minuteInputInvalidWarning] = !this.isMinuteInputValid;
      localErrorStates[this.secondInputInvalidWarning] = !this.isSecondInputValid;
      localErrorStates[this.milliSecondInputInvalidWarning] = !this
        .isMillisecondInputValid;

      let mergedErrorStates = { ...localErrorStates, ...this.errorStates };
      return mergedErrorStates;
    },
    inputTooltip() {
      // tooltip for time input box when it is disabled
      if (this.isDisabled) return this.disabledTooltip;
      return undefined;
    },
    defaultBoxClass() {
      // centering the text specifically for time boxes
      return [
        "text-center disabled:opacity-50",
        { "cursor-not-allowed": this.isDisabled },
      ];
    },
    invalidInputStyle() {
      // show a red border if input is invalid
      return "border-red-500";
    },
    hourInputInvalidClass() {
      // this style class will be added to the hour input
      // if hour input is not valid
      return !this.isHourInputValid ? this.invalidInputStyle : undefined;
    },
    minuteInputInvalidClass() {
      return !this.isMinuteInputValid ? this.invalidInputStyle : undefined;
    },
    secondInputInvalidClass() {
      return !this.isSecondInputValid ? this.invalidInputStyle : undefined;
    },
    millisecondInputInvalidClass() {
      return !this.isMillisecondInputValid ? this.invalidInputStyle : undefined;
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
      // mark that this change is external and NOT internal
      this.setChangeAsExternal();
      return this.timeObject;
    },
    hour: {
      get() {
        // if the change in hour value is internal
        //    then we need to check the validity of "localHour", the local value
        // else we need to check the validity of the value coming from the props
        // and then show the value inside the textbox
        var valueToShow = this.isInternalChange
          ? this.localHour
          : this.localTimeObject.hour;

        this.checkHourValidity(valueToShow);
        return valueToShow;
      },
      set(hour) {
        // set the change as internal - as the value is being set from the textbox
        // save the user's input locally
        // emit the change only if the change is valid
        this.setChangeAsInternal();
        this.localHour = hour;
        if (this.checkHourValidity(hour)) {
          this.localTimeObject.hour = hour;
          this.$emit("update:timeObject", this.localTimeObject);
        }
      },
    },
    minute: {
      get() {
        // if the change in minute value is internal
        //    then we need to check the validity of "localMinute", the local value
        // else we need to check the validity of the value coming from the props
        // and then show the value inside the textbox
        var valueToShow = this.isInternalChange
          ? this.localMinute
          : this.localTimeObject.minute;

        this.checkMinuteValidity(valueToShow);
        return valueToShow;
      },
      set(minute) {
        // set the change as internal - as the value is being set from the textbox
        // save the user's input locally
        // emit the change only if the change is valid
        this.setChangeAsInternal();
        this.localMinute = minute;

        if (this.checkMinuteValidity(minute)) {
          this.localTimeObject.minute = minute;
          this.$emit("update:timeObject", this.localTimeObject);
        }
      },
    },
    second: {
      get() {
        // if the change in second value is internal
        //    then we need to check the validity of "localSecond", the local value
        // else we need to check the validity of the value coming from the props
        // and then show the value inside the textbox
        var valueToShow = this.isInternalChange
          ? this.localSecond
          : this.localTimeObject.second;

        this.checkSecondValidity(valueToShow);
        return valueToShow;
      },
      set(second) {
        // set the change as internal - as the value is being set from the textbox
        // save the user's input locally
        // emit the change only if the change is valid
        this.setChangeAsInternal();
        this.localSecond = second;

        if (this.checkSecondValidity(second)) {
          this.localTimeObject.second = second;
          this.$emit("update:timeObject", this.localTimeObject);
        }
      },
    },
    millisecond: {
      get() {
        // if the change in millisecond value is internal
        //    then we need to check the validity of "localMillisecond", the local value
        // else we need to check the validity of the value coming from the props
        // and then show the value inside the textbox
        var valueToShow = this.isInternalChange
          ? this.localMillisecond
          : this.localTimeObject.millisecond;

        this.checkMillisecondValidity(valueToShow);
        return valueToShow;
      },
      set(millisecond) {
        // set the change as internal - as the value is being set from the textbox
        // save the user's input locally
        // emit the change only if the change is valid
        this.setChangeAsInternal();
        this.localMillisecond = millisecond;

        if (this.checkMillisecondValidity(millisecond)) {
          this.localTimeObject.millisecond = millisecond;
          this.$emit("update:timeObject", this.localTimeObject);
        }
      },
    },
  },
  emits: ["update:timeObject", "error-occurred", "error-resolved"],
};
</script>
