<template>
  <transition name="fade">
    <div class="modal" v-if="show">
      <!-- <div class="modal__backdrop" @click="closeModal()"/> -->

      <div class="modal__dialog">
        <div class="modal__body">
          <!-- The cross button to close the modal -->
          <div class="question-text-row">
            <div class="question-text" id="question" v-html="questionText"></div>
            <div class="close-container" id="skip-button" @click="clickSkip">
              <font-awesome-icon
                :icon="['fas', 'window-close']"
                class="skip-icon"
                :class="{ hidden: isAnswerSubmitted }"
              ></font-awesome-icon>
            </div>
          </div>

          <div
            id="options-container"
            class="options"
            :class="{ optionsBlock: isAnswerSubmitted }"
          >
            <ul>
              <li class="option">
                <div
                  v-for="(option, optionNumber) in plioQuestion.item.details.options"
                  :key="option"
                  class="answer-option radio"
                  :ref="option"
                >
                  <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
                  <label class="label">
                    <input
                      type="radio"
                      name="options"
                      v-model="selectedOption"
                      :value="option"
                      :id="'option_input_' + optionNumber"
                      @click="selectOption(optionNumber)"
                    />
                    <div
                      class="option_render"
                      :id="option"
                      v-html="optionText[optionNumber]"
                    ></div>
                  </label>
                </div>
              </li>
            </ul>

            <!-- Selected: {{ selectedOption }} -->
            <mcqOptionsPointer
              v-if="
                !isAnAnsweredQuestion &&
                !isTutorialComplete &&
                !tutorialProgress['options']
              "
            >
            </mcqOptionsPointer>
          </div>
        </div>

        <!-- revise button -->
        <div class="modal__footer">
          <font-awesome-icon
            :icon="['fas', 'check-circle']"
            class="correct-icon"
            ref="correct-icon"
            v-if="isAnswerSubmitted && isAnswerCorrect"
          ></font-awesome-icon>

          <font-awesome-icon
            :icon="['fas', 'times-circle']"
            class="wrong-icon"
            ref="wrong-icon"
            v-if="isAnswerSubmitted && !isAnswerCorrect"
          ></font-awesome-icon>

          <!-- submit button -->
          <button
            id="submit-button"
            v-if="!isAnswerSubmitted"
            class="btn submit"
            :disabled="isSubmitDisabled"
            @click="clickSubmit"
          >
            ✓ {{ $t("player.question.submit") }}
          </button>
          <submit-button-pointer
            v-if="
              !isTutorialComplete &&
              !tutorialProgress['submit'] &&
              !isSubmitDisabled &&
              !isAnAnsweredQuestion
            "
          >
          </submit-button-pointer>
          <button
            id="revise-button"
            class="btn revise"
            @click="clickRevise"
            :hidden="isAnswerSubmitted"
          >
            ⟳ {{ $t("player.question.revise") }}
          </button>

          <!-- proceed button -->
          <proceed-button-pointer
            v-if="!isTutorialComplete && !tutorialProgress['close'] && isAnswerSubmitted"
          >
          </proceed-button-pointer>
          <button v-if="isAnswerSubmitted" class="btn close" @click="clickProceed">
            {{ $t("player.question.proceed") }}
          </button>
        </div>
        <progress-bar
          v-if="isProgressBarEnabled"
          ref="progressBarRef"
          :startPercent="progressBarInfo['progressPercent']"
          :config="progressBarInfo['config']"
        >
        </progress-bar>
      </div>
    </div>
  </transition>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons/faWindowClose";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons/faTimesCircle";
library.add(faWindowClose, faCheckCircle, faTimesCircle);

import SubmitButtonPointer from "@/components/UIComponents/tutorial/SubmitButtonPointer.vue";
import mcqOptionsPointer from "@/components/UIComponents/tutorial/mcqOptionsPointer.vue";
import ProceedButtonPointer from "@/components/UIComponents/tutorial/ProceedButtonPointer.vue";

import ProgressBar from "@/components/UIComponents/ProgressBar.vue";

export default {
  components: {
    SubmitButtonPointer,
    mcqOptionsPointer,
    ProceedButtonPointer,
    ProgressBar,
  },
  name: "PlioQuestion",
  props: ["plioQuestion", "isTutorialComplete", "tutorialProgress", "progressBarInfo"],
  data() {
    return {
      show: false, // whether to show this question or not
      selectedOption: null, // the content of the option that is selected
      isAnswerSubmitted: false, // whether any answer has been submitted
      newProgressBarInfo: {
        // info needed for the Progress bar
        config: this.progressBarInfo["config"],
        progressPercent: 0,
        totalQuestions: this.progressBarInfo["totalQuestions"],
      },
      questionText: this.plioQuestion.item.details.text, // content for the question
      optionText: this.plioQuestion.item.details.options, // content for the options
    };
  },

  computed: {
    // Submit button disabled if no option selected or screen is loading
    isSubmitDisabled() {
      return this.selectedOption == null || this.isAnswerSubmitted == true;
    },
    // Returns index of the correct answer (0 indexed)
    correctAnswerIndex() {
      return this.plioQuestion.item.details.correct_answer;
    },
    // Returns the text of the correct answer
    correctAnswer() {
      return this.plioQuestion.item.details.options[this.correctAnswerIndex];
    },
    // Returns the index of the question that has popped up.
    currentQuestionIndex() {
      return this.plioQuestion.id;
    },
    // whether the question has been already answered
    isAnAnsweredQuestion() {
      return this.plioQuestion.state == "answered";
    },
    // whether the submitted answer is correct
    isAnswerCorrect() {
      return this.selectedOption == this.correctAnswer;
    },
    isProgressBarEnabled() {
      if ("enabled" in this.progressBarInfo["config"])
        return this.progressBarInfo["config"]["enabled"];

      return false;
    },
  },
  methods: {
    // Closes the question window
    closeModal() {
      this.show = false;
      document.querySelector("body").classList.remove("overflow-hidden");
    },

    selectOption(optionIndex) {
      this.$emit("update-journey", "option-selected", {
        question: Number(this.plioQuestion.id),
        option: optionIndex,
      });
    },

    // Opens the question window
    openModal() {
      // Show highlighted options if coming back to an answered question
      // Wait 200 ms because it takes some time to find the DOM elements
      if (this.isAnAnsweredQuestion) {
        requestAnimationFrame(() => {
          this.isAnswerSubmitted = true;

          // highlight wrong/right depending on what the user answered in previous session
          var selectedOption = document.getElementById(
            `option_input_${this.plioQuestion.userAnswerIndex}`
          );
          selectedOption.checked = true;
          this.selectedOption = this.plioQuestion.item.details.options[
            this.plioQuestion.userAnswerIndex
          ];
          this.showResult();
          this.disableRadioButtons();
        });
      }

      this.show = true;
      document.querySelector("body").classList.add("overflow-hidden");
      this.newProgressBarInfo["progressPercent"] = this.progressBarInfo[
        "progressPercent"
      ];
      this.handleImage();
      this.styleQuestion();
      this.styleOptions();
      this.renderContent();
    },

    handleImage() {
      this.$nextTick(() => {
        // get question element
        var question = document.getElementById("question");
        if (question == null) return;
        // extract all <p> tags from the question element
        var p_tags = question.querySelectorAll("p");
        if (p_tags == null || p_tags.length == 0) return;
        // find which <p> tag has an <img> tag, cut it and
        // paste it right outside, just below it.
        p_tags.forEach((p_tag) => {
          var img_tag = p_tag.querySelector("img");
          if (img_tag != null) {
            p_tag.removeChild(img_tag);
            p_tag.parentNode.insertBefore(img_tag, p_tag.nextSibling);
            // scale the image such that width is 1/3rd of screen width
            // maintaining the aspect ratio
            var currWidth = 0;
            var currHeight = 0;
            var finalWidth = window.screen.availWidth / 2.5;
            var finalHeight = 0;
            var parentDivWidth = document.getElementById("question").clientWidth;
            var parentDivHeight = document.getElementById("question").clientHeight;
            // handling cases - "50%" and "50px" separately
            if (img_tag.style.width.includes("%")) {
              // extract % value -> take product with the parentDiv width
              // -> convert to string with 'px'
              currWidth =
                String((parseInt(img_tag.style.width, 10) * parentDivWidth) / 100) + "px";
            } else {
              currWidth = parseInt(img_tag.style.width, 10);
            }

            if (img_tag.style.height.includes("%")) {
              // extract % value -> take product with the parentDiv height
              // -> convert to string with 'px'
              currHeight =
                String((parseInt(img_tag.style.height, 10) * parentDivHeight) / 100) +
                "px";
            } else {
              currHeight = parseInt(img_tag.style.height, 10);
            }

            if (currHeight && currWidth) {
              var aspectRatio = currWidth / currHeight;
              finalHeight = finalWidth / aspectRatio;
            }

            img_tag.style.width = String(finalWidth) + "px";
            // if height is not available, it will be defaulted
            // to 100% of the parent div automatically
            if (img_tag.style.height) img_tag.style.height = String(finalHeight) + "px";
          }
        });
      });
    },

    renderContent() {
      // force rendering of question and option texts
      this.$nextTick(() => {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "question"]);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "option"]);
      });
    },

    styleQuestion() {
      // for each <p> tag in the question, set some CSS
      // specifically overrides default <p> CSS for these tags
      this.$nextTick(() => {
        var question = document.getElementById("question");
        if (question == null) return;

        var p_tags = question.querySelectorAll("p");
        if (p_tags == null || p_tags.length == 0) return;

        p_tags.forEach((p_tag) => {
          p_tag.style.lineHeight = "100%";
          p_tag.style.marginRight = "auto";
          p_tag.style.marginBlock = "5px";
        });
      });
    },

    styleOptions() {
      // for each <p> tag in the option, set some CSS
      // specifically overrides default <p> CSS for these tags
      this.$nextTick(() => {
        var optionParents = document.getElementsByClassName("option_render");
        if (optionParents == null) return;

        optionParents.forEach((option) => {
          var optionTexts = option.querySelectorAll("p");
          if (optionTexts == null || optionTexts.length == 0) return;

          optionTexts.forEach((optionText) => {
            optionText.style.lineHeight = "100%";
            optionText.style.marginBlock = "5px";
          });
        });
      });
    },

    // Highlights the correct option as green, wrong one as red
    showResult() {
      if (!this.isAnswerCorrect) {
        this.$refs[this.selectedOption].classList.add("wrongAnswer");
      }

      this.$refs[this.correctAnswer].classList.add("correctAnswer");
    },

    removeOptionHighlight() {
      var allOptions = document.querySelectorAll(".answer-option");

      allOptions.forEach((option) => {
        option.removeAttribute("class");
        option.className = "answer-option";
      });
    },

    toggleMarkers(index) {
      var markers = document.querySelectorAll("#marker");

      if (markers[index].className == "tooltip") {
        markers[index].classList.remove("tooltip");
        markers[index].classList.add("tooltip-answered");
      }
    },

    disableRadioButtons() {
      document.getElementsByName("options").forEach((option) => {
        option.disabled = true;
      });
    },

    updateAndShowProgress() {
      if (this.plioQuestion.state != "answered") {
        this.newProgressBarInfo["progressPercent"] +=
          (1 / this.newProgressBarInfo["totalQuestions"]) * 100;
      }

      this.$nextTick(() => {
        this.$refs["progressBarRef"].progressTo(
          this.newProgressBarInfo["progressPercent"]
        );
      });
    },

    clickSubmit() {
      // Things to do after clicking submit
      // 1-Remove old option highlights
      // 2-Toggle the current marker from red to green
      // 3-hide the revise/skip/submit buttons
      // 4-check answer and show new result

      this.disableRadioButtons();
      this.removeOptionHighlight();
      this.toggleMarkers(this.currentQuestionIndex);
      this.isAnswerSubmitted = true;

      this.$nextTick(() => {
        this.showResult();
        if (this.isProgressBarEnabled) {
          this.updateAndShowProgress();
        }
      });

      this.$emit("answer-submitted");
    },

    // Things to do after answer is submitted
    // and proceed button appears
    clickProceed() {
      this.closeModal();
      this.$emit(
        "question-completed",
        this.plioQuestion,
        this.selectedOption,
        this.newProgressBarInfo
      );
    },

    // Things to do when revise button is clicked
    clickRevise() {
      this.closeModal();
      this.$emit("clicked-revise", this.plioQuestion);
    },

    clickSkip() {
      this.closeModal();
      this.$emit("question-skipped", this.plioQuestion);
    },
  },
  mounted() {
    // after DOM has been mounted/rendered, manipulating the DOM
    // to add MathJax CDN links to the document head + some configs
    let mathJaxConfigParent = document.createElement("script");
    mathJaxConfigParent.setAttribute("type", "text/x-mathjax-config");

    var configString = `MathJax.Hub.Config({
        messageStyle: 'none',
        tex2jax: {
          preview: 'none'
        },
        showProcessingMessages: false,
        'HTML-CSS': {
          imageFont: null
        }
      });`;

    var configInnerText = document.createTextNode(configString);
    mathJaxConfigParent.appendChild(configInnerText);
    document.head.appendChild(mathJaxConfigParent);

    let mathJaxCDN = document.createElement("script");
    mathJaxCDN.setAttribute("type", "text/javascript");
    mathJaxCDN.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML";
    document.head.appendChild(mathJaxCDN);
  },
  emits: [
    "update-journey",
    "question-skipped",
    "answer-submitted",
    "clicked-revise",
    "question-completed",
  ],
};
</script>

<style lang="scss" scoped>
$color1: #f4f4;
$color2: #3197ee;
$softorange: #f4a259;
$tomatored: #f25c66;
$mediumblu: #1e272d;

.correct-icon {
  color: #008000;
  font-size: 3em;
}

.wrong-icon {
  color: red;
  font-size: 3em;
}

.skip-icon {
  font-size: 1.3em;
  color: rgb(220, 20, 60);
}

.question-text-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
}

.close-container {
  margin-top: 16px;
  margin-right: 20px;
  cursor: pointer;
  padding-left: 3px;
}

.leftright {
  height: 4px;
  width: 20px;
  position: absolute;
  background-color: $softorange;
  border-radius: 2px;
  transform: rotate(45deg);
  transition: all 0.3s ease-in;
}

.rightleft {
  height: 4px;
  width: 20px;
  position: absolute;
  background-color: $softorange;
  border-radius: 2px;
  transform: rotate(-45deg);
  transition: all 0.3s ease-in;
}

li {
  list-style: none;
}

.hidden {
  visibility: hidden;
}

.answer-option {
  text-align: left;
  padding: 2px;
  margin: 5px;
  font-size: 1.3rem;
  @media (orientation: portrait) {
    margin-right: 10px;
  }
  margin-right: 57px;
  border-radius: 5px;
}

.label {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.options {
  display: flex;
  align-items: center;
}

.optionsBlock {
  display: block;
}

.correctAnswer {
  background-color: lightgreen;
}

.wrongAnswer {
  background-color: indianred;
  color: white;
}

.question-text {
  text-align: left;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

input {
  margin: 0.6rem;
}

.modal {
  position: absolute;
  top: 0;
  right: 0;
  text-align: left;
  display: flex;
  justify-content: center;
  bottom: 0;
  left: 0;
  z-index: 9;
  // padding-top: 16px;
  &__backdrop {
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
  }
  &__dialog {
    background-color: #ffffff;
    position: relative;
    width: 100%;
    height: 100%;
    margin: auto;
    justify-content: center;
    display: flex;
    overflow-y: scroll;
    flex-direction: column;
    border-radius: 5px;
    z-index: 2;
    // @media screen and (max-width: 992px) {
    //   width: 90%;
    // }
  }
  .last-item {
    margin-top: auto;
  }

  h3 {
    padding: 0;
    margin-top: 16px;
    margin-bottom: 0;
  }
  &__close {
    width: 30px;
    height: 30px;
    margin: 16px;
  }
  &__header {
    padding-left: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  &__body {
    padding: 4px 4px 4px;
    padding-left: 16px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: auto;
    margin-bottom: auto;
    scrollbar-face-color: #367cd2;
    scrollbar-shadow-color: #ffffff;
    scrollbar-highlight-color: #ffffff;
    scrollbar-3dlight-color: #ffffff;
    scrollbar-darkshadow-color: #ffffff;
    scrollbar-track-color: #ffffff;
    scrollbar-arrow-color: #ffffff;
  }
  &__body::-webkit-scrollbar {
    width: 8px;
  }
  &__body::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  }
  &__body::-webkit-scrollbar-thumb {
    background: rgba(238, 205, 73, 0.8);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
  }
  &__footer,
  &__footer__buttons {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    // margin-bottom: auto;
    @media (orientation: portrait) {
      padding: 4px 40px 4px;
    }
    padding: 4px 80px 4px;
    background-color: #ececec;
    box-shadow: 0px -1px 6px #5e5e5d;
    z-index: 10;
  }

  &__footer__buttons {
    flex-direction: row;
  }

  .tooltip-answered {
    background: lawngreen;
    border-radius: 3px;
    bottom: 100%;
    padding: 5px 3px;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, 14px);
    z-index: 2;
  }

  .btn {
    border: none;
    color: white;
    @media (orientation: portrait) {
      padding: 2px 15px;
      height: fit-content;
    }
    padding: 2px 40px;
    text-align: center;
    text-decoration: none;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    height: 2.5em;
    font-size: 1.4rem;
  }

  .submit {
    font-weight: 700;
    background-color: #4caf50;
    color: white;
    border-bottom: outset;
  }
  .submit:hover {
    background-color: green;
    border-radius: 5px;
    color: white;
  }
  .submit:active {
    border-bottom: hidden;
  }
  .submit:disabled {
    color: gray;
    background-color: white;
    border-bottom: outset;
  }

  .close {
    background-color: white;
    color: #4caf50;
    font-weight: 700;
    border-bottom: outset;
  }
  .close:active {
    border-bottom: hidden;
  }

  .revise {
    background-color: white;
    color: blue;
    font-weight: 700;
    border-bottom: outset;
  }
  .revise:active {
    border-bottom: hidden;
  }

  :disabled {
    color: gray;
    background-color: white;
  }

  :disabled:hover {
    background-color: white;
    color: gray;
    cursor: default;
  }

  .skip {
    font-size: 1rem;
    font-weight: 500;
    background-color: white;
    color: red;
  }

  .skip:hover {
    background-color: #f44336;
    border-radius: 5px;
    color: white;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
