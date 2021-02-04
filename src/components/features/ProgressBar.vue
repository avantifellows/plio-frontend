<template>
  <div class="progress">
    <div class="progress__bar"></div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: ["initial", "config"],
  data() {
    return {
      progressBar: null
    };
  },

  created() {
    this.initializeProgressBar();
    this.setConfigProperties();
  },

  computed: {
  },

  methods: {
    initializeProgressBar(){
      setTimeout(() => {
        this.progressBar = document.querySelector(".progress__bar")
        this.progressTo(this.initial)
      }, 200)
    },

    setConfigProperties(){

    },

    progressTo(progress) {
        Object.assign(this.progressBar.style, {
          transform: `scaleX(${progress / 100})`,
          "background-position-y": progress + "%"
        });
    }
  }
}
</script>

<style lang="scss" scoped>
body {
  font: 300 1em "Inconsolata";
}

.progress {
  $self: &;

  width: 100%;
  height: 20px;
  // border: solid 1px;
  // border-radius: 2px;
  background: lightgray;

  &__bar {
    height: 100%;
    width: 100%;
    background: green;
    /* make it big to eliminate gradient color visible during single progress position */
    background-size: 100% 10000%;
    transition: ease-out 0.8s;
    transition-property: background-position, transform;
    transform-origin: 0;
    transform: scaleX(0);
  }
}

</style>