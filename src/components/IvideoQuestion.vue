
<template>
  <transition name="fade">
    <div class="modal" v-if="show">
      <!-- <div class="modal__backdrop" @click="closeModal()"/> -->

      <div class="modal__dialog">
        <div class="modal__body">
          <!-- The cross button to close the modal -->
          <div class="question_text_row">
            <div class="question_text">
              {{ ivq.item.question.text }}
            </div>
            <div
              class="close-container"
              @click="
                closeModal();
                this.$emit('answer-skipped');
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
                  v-for="option in ivq.item.question.options"
                  :key="option"
                  class="answer_option radio"
                >
                  <input
                    type="radio"
                    name="options"
                    v-model="selectedOption"
                    :value="option"
                  />{{ option }}
                </div>
              </li>
            </ul>

            <!-- Selected: {{ selectedOption }} -->
          </div>
        </div>

        <div class="modal__footer">
          <button
            class="btn btn--primary revise"
            @click="
              closeModal();
              this.$emit('revision-needed', this.ivq);
            "
          >
            Revise
          </button>
          <button
            class="btn btn--primary submit"
            :disabled="isDisabled"
            @click="
              closeModal();
              this.$emit('answer-submitted', this.ivq, this.selectedOption);
            "
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
  props: ["ivq"],
  data() {
    return {
      show: false,
      text: "Hello how are you",
      selectedOption: null,
    };
  },
  computed: {
    isDisabled() {
      return this.selectedOption == null;
    },
  },
  methods: {
    closeModal() {
      this.show = false;
      document.querySelector("body").classList.remove("overflow-hidden");
    },
    openModal() {
      this.text = "";
      this.show = true;
      document.querySelector("body").classList.add("overflow-hidden");
    },
  },
};
</script>


<style lang="scss" scoped>
$color1: #f4f4;
$color2: #3197ee;
$softorange: #f4a259;
$tomatored: #f25c66;
$mediumblu: #1e272d;

.question_text_row {
  display: flex;
  flex-direction: row;
}

.close-container {
  margin-right: 20px;
  cursor: pointer;
}

.leftright {
  height: 4px;
  width: 20px;
  position: absolute;
  margin-top: 13vh;
  background-color: $softorange;
  border-radius: 2px;
  transform: rotate(45deg);
  transition: all 0.3s ease-in;
}

.rightleft {
  height: 4px;
  width: 20px;
  position: absolute;
  margin-top: 13vh;
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