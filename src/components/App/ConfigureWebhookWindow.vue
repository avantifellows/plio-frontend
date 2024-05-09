<template>
  <div
    class="top-10/100 bottom-10/100 2xl:left-20/100 2xl:right-20/100 xl:left-15/100 xl:right-15/100 sm:left-10/100 sm:right-10/100 left-5/100 right-5/100 border-2 border-gray-200 shadow-lg rounded-lg bg-white m-auto flex flex-col fixed z-30 justify-start mx-auto p-10 space-y-4"
  >
    <!-- title -->
    <div
      class="font-bold text-gray-500 whitespace-nowrap lg:text-xl md:text-lg bp-500:text-base text-3xl tracking-tighter bp-500:py-0 py-4"
    >
      Webhook Configuration
    </div>
    <!-- url box -->
    <input-text
      :placeholder="urlInputPlaceholder"
      :title="urlInputTitle"
      :validation="urlInputValidationConfig"
      v-model:value="url"
      ref="webhookURL"
      :boxStyling="'pl-4 disabled:opacity-50 text-sm bp-500:text-base'"
      :isDisabled="false"
      v-tooltip="urlTooltip"
      data-test="webhookUrlInput"
    ></input-text>

    <!-- section for configuring payload and payload preview -->
    <div v-if="isUrlValid" class="flex flex-col justify-items-stretch justify-start h-full overflow-auto space-y-2">
      <!-- configure events to track  -->
      <div class="flex flex-col w-full border-2 rounded-lg space-y-2 px-2 h-5/6">
        <div
          class="font-bold text-gray-500 whitespace-nowrap lg:text-lg md:text-md bp-500:text-sm text-xl tracking-tighter pt-2 self-center"
        >
          Configure Events to Track
        </div>

        <div class="flex flex-col space-y-1 overflow-y-auto">
          <div v-for="(event, index) in localWebhookEvents" :key="index">
            <!-- event card -->
            <div class="flex flex-col w-full">
              <!-- event header and controls -->
              <div class="flex flex-row w-full h-full items-stretch justify-between">
                <div
                  :class="[
                    {
                      'border-b': !isTabSelected(event.code),
                    },
                    'flex flex-row bp-500:ml-0 ml-4 w-full rounded-md border-primary border-t border-l border-r p-0.5 px-1',
                  ]"
                >
                  <inline-svg
                    @click="clickTab(event.code)"
                    :src="getImageSource('play.svg')"
                    :class="getTabToggleClass(event.code)"
                  ></inline-svg>
                  <button
                    @click="clickTab(event.code)"
                    :class="getTabStyleClasses('someName')"
                  >
                    {{ event.displayName }}
                  </button>

                  <icon-button
                    v-if="event.isSelected"
                    buttonClass="px-2 transition ease-in duration-200 text-center font-light shadow-lg rounded-md bmr-2 border-primary border-2 mr-2"
                    class="relative"
                    :titleConfig="
                      {
                        value: 'Test',
                        class: 'text-gray-500 lg:text-sm md:text-sm bp-500:text-xs text-sm font-semibold',
                      }
                    "
                    @click="openTestingPanel(event, index)"
                    data-test="testWebhookButton"
                  ></icon-button>

                  <input
                    type="checkbox"
                    :class="getInputElementClass('checkbox')"
                    style="box-shadow: none"
                    @change="() => {
                      event.isSelected = !event.isSelected;
                      // if all events are unselected, then close the testing panel
                      if (!localWebhookEvents.some((event) => event.isSelected)) {
                        isTestingPanelOpen = false;
                        currentlyTestingEventTab = null;
                      }
                    }"
                    :checked="event.isSelected"
                    data-test="input"
                  />
                </div>
              </div>

              <!-- event details and example -->
              <div
                class="flex flex-col pl-4 space-y-2 py-2 bg-gray-200 border-gray-300 border-l border-r border-b w-99/100 ml-0.5"
                v-if="isTabSelected(event.code)"
              >
                <!-- description -->
                <div
                  class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter pt-2 self-start w-full"
                >
                  Description:
                  <div class="font-normal text-black whitespace-normal">
                    {{ event.description }}
                  </div>
                </div>

                <!-- event code -->
                <div
                  class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter pt-2 self-start"
                >
                  Event Code:
                  <p
                    class="font-semibold bg-gray-500 text-red-200 p-1 px-2 rounded-md font-mono"
                  >
                    {{ event.code }}
                  </p>
                </div>

                <!-- extra data -->
                <div
                  v-if="'extraData' in event"
                  class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter pt-2 self-start"
                >
                  Extra Data:
                  <div
                    v-for="data in event.extraData"
                    :key="data.code"
                    class="flex flex-col"
                  >
                    <div class="flex flex-row space-x-1 py-1">
                      <p
                        class="font-normal bg-gray-500 text-red-200 p-1 px-2 rounded-md font-mono max-w-min h-full"
                      >
                        {{ data.code }}
                      </p>
                      <p
                        class="font-normal bg-gray-500 text-blue-200 p-1 px-2 rounded-md font-mono max-w-min h-full"
                      >
                        {{ data.type }}
                      </p>
                      <div class="font-normal text-black whitespace-normal">
                        {{ data.description }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="'payloadExample' in event"
                  class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter pt-2 self-start"
                >
                  Example Payload:
                  <code-highlighter language="javascript">
                    <pre>
                      {{ event.payloadExample ?? "" }}
                    </pre>
                  </code-highlighter>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- test -->
      <div v-if="isTestingPanelOpen" class="flex flex-row w-full border-2 rounded-lg p-2 items-center justify-center space-x-10">
        <!-- payload preview -->
        <div class="flex flex-col h-full pt-4">
          <div class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter py-2 self-center">Payload Preview</div>
          <code-highlighter language="javascript">
            <pre>{{ testingPanelPayloadPreview }}</pre>
          </code-highlighter>
        </div>

        <!-- test button  -->
        <div class="flex h-12 self-center">
          <icon-button
            buttonClass="bp-500:px-8 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center font-semibold shadow-lg rounded-lg bg-primary border-b-outset border-primary"
            class="relative"
            :titleConfig="mainTestButtonTitleConfig"
            @click="testWebhook"
            data-test="testWebhookButton"
            :iconConfig="{
              enabled: isLoading,
              iconName: 'spinner-solid',
              iconClass: 'stroke-0 text-white white animate-spin w-4 h-4',
            }"
            :isDisabled="isLoading"
          ></icon-button>
        </div>

        <!-- testing response -->
        <div class="flex h-full flex-col pt-4">
          <div class="font-bold text-primary whitespace-nowrap lg:text-md md:text-sm bp-500:text-xs text-lg tracking-tighter py-2 self-center">Testing Response</div>
          <code-highlighter v-if="testingPanelTestingResponseStatusCode !== null" language="javascript">
            <pre>Status Code: {{ testingPanelTestingResponseStatusCode }}</pre>
          </code-highlighter>
          <code-highlighter v-if="testingPanelTestingResponse !== ''" language="javascript">
            <pre>{{ testingPanelTestingResponse }}</pre>
          </code-highlighter>
        </div>
      </div>
    </div>

    <!-- footer buttons - save + cancel -->
    <div class="w-full flex flex-row bp-500:justify-end justify-around space-x-2 bp-500:mt-auto mt-2">
      <!-- save button -->
      <span v-tooltip="saveButtonTooltip" tabindex="0">
        <!-- unsaved changes ping -->
        <div
          class="w-3 h-3 bg-primary animate-ping rounded-full absolute opacity-75"
          v-if="areThereUnsavedChanges"
        ></div>
        <icon-button
          :buttonClass="saveButtonClass"
          class="relative"
          :titleConfig="saveButtonTitleConfig"
          @click="saveChanges"
          :isDisabled="!areThereUnsavedChanges"
          data-test="saveButton"
        ></icon-button>
      </span>
      <!-- cancel button -->
      <icon-button
        :buttonClass="cancelButtonClass"
        :titleConfig="cancelButtonTitleConfig"
        @click="discardChanges"
        data-test="cancelButton"
      ></icon-button>
    </div>

  </div>
</template>

<script>
import InputText from "@/components/UI/Text/InputText.vue";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import { mapGetters } from "vuex";
import { component as VueCodeHighlight } from "vue-code-highlight";
import CodeHighlighter from "@/components/Editor/CodeHighlighter.vue";
import { webhookEvents } from "@/services/Config/GlobalDefaultSettings.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
let clonedeep = require("lodash.clonedeep");

export default {
  name: "ConfigureWebhookWindow",
  components: {
    IconButton,
    InputText,
    VueCodeHighlight,
    CodeHighlighter,
  },
  props: {
    plioStatus: {
      type: String,
      default: "draft",
    },
    customWebhookSettings: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      webhookEvents: webhookEvents,
      cancelButtonClass:
        "bp-500:px-7 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center text-base font-semibold shadow-lg rounded-lg bg-white border-b-outset",
      saveButtonClass:
        "bp-500:px-8 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center font-semibold shadow-lg rounded-lg bg-primary border-b-outset border-primary",
      saveButtonTitleConfig: {
        value: this.$t(`settings.buttons.save.${this.plioStatus}`),
        class: "text-white lg:text-base md:text-sm bp-500:text-xs text-lg font-bold",
      },
      cancelButtonTitleConfig: {
        value: this.$t("settings.buttons.cancel"),
        class: "text-primary lg:text-base md:text-sm bp-500:text-xs text-lg font-bold",
      },
      url: "",
      urlTooltip:
        "Enter the URL of your webhook here. The URL should start with https:// and end with a trailing slash, and have a valid domain name.",
      currentSelectedEventTab: null,
      isTestingPanelOpen: false,
      currentlyTestingEventTab: null,
      currentlyTestingEventTabIndex: null,
      testingPanelPayloadPreview: "",
      testingPanelTestingResponse: "",
      testingPanelTestingResponseStatusCode: null,
      isLoading: false,
      localWebhookEvents: null
    };
  },
  methods: {
    createLocalWebhookObject() {
      this.localWebhookEvents = clonedeep(webhookEvents);

      // check the customWebhookSettings object. It has a `enabledEvents` array. This contains strings which will match the `code` property of the webhookEvents object.
      // Go through all the enabledEvents elements and for each element, set the `isSelected` property of the corresponding localWebhookEvents object to true.
      if (
        "value" in this.customWebhookSettings && 
        "enabledEvents" in this.customWebhookSettings.value
      ) {
        this.customWebhookSettings.value.enabledEvents.forEach((eventCode) => {
          let eventIndex = this.localWebhookEvents.findIndex((event) => event.code == eventCode);
          if (eventIndex != -1) {
            this.localWebhookEvents[eventIndex].isSelected = true;
          }
        });
      }
    },
    openTestingPanel(event, index) {
      // set details for testing panel functionality
      if (this.currentlyTestingEventTab == null) {
        this.isTestingPanelOpen = true
        this.currentlyTestingEventTab = event.code
        this.currentlyTestingEventTabIndex = index

        this.setupDataForTestingPanel(event)
      } else if (this.currentlyTestingEventTab == event.code) {
        this.isTestingPanelOpen = false
        this.currentlyTestingEventTab = null
        this.currentlyTestingEventTabIndex = null

        this.clearTestingPanelData()
      } else {
        this.isTestingPanelOpen = true
        this.currentlyTestingEventTab = event.code
        this.currentlyTestingEventTabIndex = index

        this.setupDataForTestingPanel(event)
      }

      this.currentSelectedEventTab = null
    },
    setupDataForTestingPanel(event) {
      this.testingPanelPayloadPreview = event.payloadExample ?? "";
      this.testingPanelTestingResponse = "";
      this.testingPanelTestingResponseStatusCode = null;
    },
    clearTestingPanelData() {
      this.testingPanelPayloadPreview = "";
      this.testingPanelTestingResponse = "";
      this.testingPanelTestingResponseStatusCode = null;
    },
    constructDataToEmit() {
      let enabledEvents = this.localWebhookEvents.filter((event) => event.isSelected).map((event) => event.code);
      return {
        webhookURL: this.url,
        enabledEvents: enabledEvents,
      };
    },
    testWebhook() {
      this.isLoading = true
      fetch(
        this.url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.parse(this.localWebhookEvents[this.currentlyTestingEventTabIndex].payloadExample)),
        }
      ).then(async (response) => {
        this.isLoading = false
        const x = await response.json()
        this.testingPanelTestingResponse = JSON.stringify(x, null, 2);
        this.testingPanelTestingResponseStatusCode = response.status;
      }).catch((error) => {
        console.log(error)
        this.isLoading = false
        this.testingPanelTestingResponse = JSON.stringify({
          error: error.message,
        }, null, 2);
        this.testingPanelTestingResponseStatusCode = 'ERROR';
      });


    },
    getImageSource: GenericUtilities.getImageSource,
    saveChanges() {
      this.$emit("updated", this.constructDataToEmit())
      this.$emit("close-signal")
    },
    discardChanges() {
      this.$emit("close-signal")
    },
    // Get the style classes for a particular toggable tab
    getTabToggleClass(tabCodeName) {
      return [
        {
          "transform rotate-90": this.isTabSelected(tabCodeName),
        },
        "w-6 h-6 text-yellow-600 fill-current my-auto transition duration-800 mr-2",
      ];
    },
    /**
     * Get style classes for how a tab looks on the sidebar region
     * @param {String} tabName - The name of the tab for which the style classes are required
     */
    getTabStyleClasses(tabCodeName) {
      return "text-primary leading-relaxed pl-2 font-medium w-full capitalize whitespace-nowrap lg:text-base md:text-sm bp-500:text-xs text-xl text-left py-1"
    },
    clickTab(tabCodeName) {
      if (this.currentSelectedEventTab === tabCodeName) {
        this.currentSelectedEventTab = null;
        
      }
      else this.currentSelectedEventTab = tabCodeName;
    },
    isTabSelected(tabCodeName) {
      return this.currentSelectedEventTab == tabCodeName;
    },
    getInputElementClass(inputType) {
      let mapping = {
        checkbox:
          "ml-auto rounded my-auto lg:h-6 lg:w-6 md:h-6 md:w-6 sm:h-6 sm:w-6 bp-500:w-6 bp-500:h-6 h-4 w-4 border-2 bg-gray-100 text-primary hover:cursor-pointer",
      };
      return inputType in mapping ? mapping[inputType] : "";
    },
  },
  computed: {
    ...mapGetters("generic", ["isMobileScreen"]),
    saveButtonTooltip() {
      return this.areThereUnsavedChanges
        ? this.$t("tooltip.settings.buttons.save.hasUnsavedChanges")
        : this.$t("tooltip.settings.buttons.save.noUnsavedChanges");
    },
    areThereUnsavedChanges() {
      // check if url is valid and the new url is different from the old url
      if (!this.isUrlValid) return false;

      const isUrlChanged = this.url != this.customWebhookSettings.value.webhookURL;
      const isEventsChanged = this.localWebhookEvents.some((event) => event.isSelected != this.customWebhookSettings.value.enabledEvents.includes(event.code));

      if (isUrlChanged || isEventsChanged) return true;
      return false
    },
    urlInputPlaceholder() {
      return this.$t("editor.settings.webhook.url_input_placeholder");
    },
    urlInputTitle() {
      return "Enter your webhook's URL here";
    },
    saveButtonTooltip() {
      return this.areThereUnsavedChanges
        ? this.$t("tooltip.settings.buttons.apply_webhook_configuration")
        : this.$t("tooltip.settings.buttons.discard_webhook_configuration");
    },
    isUrlValidationEnabled() {
      return this.url.trim() == "" ? false : true;
    },
    isUrlValid() {
      // the logic below returns true if the url is valid and returns false otherwise.
      // The conditions for validity are -
      // 1. The url is an empty string after trimming
      // 2. The url should not have a http:// or ws:// or wss:// prefix
      // 3. The url should start with https://.
      // 4. The url has a trailing slash
      // 5. The url has at least one . in the domain name

      // if the url is empty, return false
      if (this.url.trim() == "") {
        return false;
      }

      // if the url has a http:// or ws:// or wss:// prefix, return false
      if (this.url.match(/^(http:\/\/|ws:\/\/|wss:\/\/)/)) {
        return false;
      }

      // if the url does not start with https://, return false
      if (!this.url.match(/^https:\/\//)) {
        return false;
      }

      // if the url does not have at least one . in the domain name, return false
      if (!this.url.match(/\./)) {
        return false;
      }

      return true;
    },
    urlInputValidationConfig() {
      return {
        enabled: this.isUrlValidationEnabled,
        isValid: this.isUrlValid,
        validMessage: "Valid URL",
        invalidMessage: "Invalid URL",
      };
    },
    mainTestButtonTitleConfig() {
      if (this.isLoading) return {}
      return {
        value: "Test",
        class: "text-white lg:text-base md:text-sm bp-500:text-xs text-lg font-bold",
      };
    },
  },
  watch: {
  },
  created() {
    this.createLocalWebhookObject();
  },
  mounted() {
    this.url = this.customWebhookSettings.value.webhookURL ?? "";
  },
};
</script>
