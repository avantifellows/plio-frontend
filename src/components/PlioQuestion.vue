
<template>
  <transition name="fade">
    <div class="modal" v-if="show">
      <!-- <div class="modal__backdrop" @click="closeModal()"/> -->

      <div class="modal__dialog">
        <div class="modal__body">
          <!-- The cross button to close the modal -->
          <div class="question_text_row">
            <div class="question_text">
              {{ plioQuestion.item.question.text }}
            </div>
            <div
              class="close-container"
              id="skip-button"
              @click="
                closeModal();
                this.$emit('answer-skipped', this.plioQuestion);
              "
            >
              <div class="leftright"></div>
              <div class="rightleft"></div>
            </div>
          </div>

          <div class="options">
            <ul>
              <li class="option">
                <div
                  v-for="option in plioQuestion.item.question.options"
                  :key="option"
                  class="answer_option radio"
                  :ref="option"
                >
                <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
                <label>
                  <input
                    type="radio"
                    name="options"
                    v-model="selectedOption"
                    :value="option"
                  />{{ option }}
                </label>
                </div>
              </li>
            </ul>

            <!-- Selected: {{ selectedOption }} -->
          </div>
        </div>

        <div class="modal__footer">
          <button
            id="revise-button"
            class="btn revise"
            @click="
              closeModal();
              this.$emit('revision-needed', this.plioQuestion);
            "
          >
            Revise
          </button>

          <i class="fas fa-check-circle" ref="correct-icon" 
            v-if="isAnswerSubmitted && isAnswerCorrect"></i>
            
          <i class="fas fa-times-circle" ref="wrong-icon"
            v-if="isAnswerSubmitted && !isAnswerCorrect"></i>

          <button
            class="btn submit"
            :disabled="isDisabled"
            @click="clickSubmit"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "IvideoQuestion",
  props: ["plioQuestion"],
  data() {
    return {
      show: false,
      text: "",
      selectedOption: null,
      isAnswerCorrect: false,
      isAnswerSubmitted: false
    };
  },

  computed: {
    // Submit button disabled if no option selected
    isDisabled() {
      return (this.selectedOption == null || this.isAnswerSubmitted == true);
    },
    // Returns index of the correct answer (1 indexed)
    correctAnswerIndex() {
      return this.plioQuestion.item.question.answers-1;
    },
    // Returns the text of the correct answer
    correctAnswer() {
      return this.plioQuestion.item.question.options[this.correctAnswerIndex];
    }
  },
  methods: {
    // Closes the question window
    closeModal() {
      this.show = false;
      document.querySelector("body").classList.remove("overflow-hidden");
    },

    // Opens the question window
    openModal() {
      this.text = "";
      this.show = true;
      document.querySelector("body").classList.add("overflow-hidden");
    },

    // Checks if the selected option is correct or not
    checkAnswer(){
      this.isAnswerCorrect = this.selectedOption == this.correctAnswer
    },
    
    // Highlights the correct option as green, wrong one as red
    showResult(){
      if (!this.isAnswerCorrect) 
        this.$refs[this.selectedOption].className = "answer_option-wrongAnswer"
      
      this.$refs[this.correctAnswer].className = "answer_option-correctAnswer"
    },

    // Things to do after submit is clicked
    clickSubmit(){
      this.isAnswerSubmitted = true;

      document.getElementById('skip-button').hidden = true
      document.getElementById('revise-button').hidden = true
      
      this.checkAnswer();
      this.showResult();

      // Closes the question window after 3 seconds
      setTimeout(() => {
        this.closeModal();
        this.$emit('answer-submitted', this.plioQuestion, this.selectedOption);
        this.isAnswerSubmitted = false;
      }, 3000);
    }
  },
  
};
</script>



<style lang="scss" scoped>
@import "../../node_modules/@fortawesome/fontawesome-free/css/all.css"; 

$color1: #f4f4;
$color2: #3197ee;
$softorange: #f4a259;
$tomatored: #f25c66;
$mediumblu: #1e272d;

i.fas{
  animation: createBox .25s;
} 

.fa-check-circle {
  color: green;
  font-size: 3em;
}

.fa-times-circle{
  color: red;
  font-size: 3em;
}

@keyframes createBox {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.question_text_row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
}

.close-container {
  margin-top: 16px;
  margin-right: 20px;
  cursor: pointer;
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

.answer_option {
  text-align: left;
  padding: 2px;
  margin: 5px;
  font-size: 1.3rem;
  margin-right: 57px;
  border-radius: 5px;
}

.answer_option-correctAnswer {
  text-align: left;
  padding: 2px;
  margin: 5px;
  font-size: 1.3rem;
  margin-right: 57px;
  border-radius: 5px;
  background-color:lightgreen
}

.answer_option-wrongAnswer {
  text-align: left;
  padding: 2px;
  margin: 5px;
  font-size: 1.3rem;
  margin-right: 57px;
  border-radius: 5px;
  background-color:indianred;
  color: white;
}

.question_text {
  text-align: left;
  font-size: 1.5rem;
  font-weight: bold;
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
    background-color: #eeeeee;
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
    margin-bottom: 0;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    scrollbar-face-color: #367cd2;
    scrollbar-shadow-color: #ffffff;
    scrollbar-highlight-color: #ffffff;
    scrollbar-3dlight-color: #ffffff;
    scrollbar-darkshadow-color: #ffffff;
    scrollbar-track-color: #ffffff;
    scrollbar-arrow-color: #ffffff;
  }
  &__body::-webkit-scrollbar {
    width: 12px;
  }
  &__body::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    -webkit-border-radius: 10px;
    border-radius: 10px;
  }
  &__body::-webkit-scrollbar-thumb {
    -webkit-border-radius: 10px;
    border-radius: 10px;
    background: rgba(238, 205, 73, 0.8);
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
  }
  &__footer {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px 20px;
  }

  .btn {
    background-color: #4caf50; /* Green */
    border: none;
    color: white;
    padding: 2px 16px;
    text-align: center;
    text-decoration: none;
    margin: 4px 2px;
    transition-duration: 0.4s;
    cursor: pointer;
  }

  .submit {
    font-weight: 700;
    font-size: 1rem;
    background-color: white;
    color: green;
  }

  .revise {
    font-weight: 700;
    font-size: 1rem;
  }

  :disabled {
    color: gray;
  }

  .submit:hover {
    background-color: green;
    border-radius: 5px;
    color: white;
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