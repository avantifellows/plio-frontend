
<template>
  <transition name="fade">
    <div class="modal" v-if="show">
      <!-- <div class="modal__backdrop" @click="closeModal()"/> -->

      <div class="modal__dialog">
        <div class="modal__header">
          <h3>Question</h3>
          <button type="button" class="modal__close" @click="closeModal()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
              <path
                fill="currentColor"
                d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
              ></path>
            </svg>
          </button>
        </div>

        <div class="modal__body">
          <div class="question_text">
            {{ ivq.item.question.text }}
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

            Selected: {{ selectedOption }}
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn--secondary skip" @click="closeModal()">Skip</button>
          <button class="btn btn--primary submit" @click="closeModal()">Submit</button>
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
  methods: {
    closeModal() {
      this.show = false;
      document.querySelector("body").classList.remove("overflow-hidden");
    },
    openModal() {
      this.text = "What the hell";
      this.show = true;
      document.querySelector("body").classList.add("overflow-hidden");
    },
  },
};
</script>


<style lang="scss" scoped>
$color1: #f4f4;
$color2: #3197ee;

li {
  list-style: none;
}

.answer_option {
  text-align: left;
  padding: 2px;
  margin: 5px;
}

.question_text {
  text-align: left;
}

input {
  margin: 0.6rem;
}

.modal {
  overflow-x: hidden;
  overflow-y: hidden;
  position: absolute;
  top: 0;
  right: 0;
  text-align: left;
  display: flex;
  justify-content: center;
  bottom: 0;
  left: 0;
  z-index: 9;
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
    width: 600px;
    height: 90%;
    margin: auto;
    justify-content: center;
    display: flex;
    overflow-y: scroll;
    flex-direction: column;
    border-radius: 5px;
    z-index: 2;
    @media screen and (max-width: 992px) {
      width: 90%;
    }
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
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
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

  .submit:hover {
    background-color:green;
    border-radius: 5px;
    color: white;
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