<template>
  <div class="progress progress-striped">
    <div class="progress__bar"></div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: ["startPercent", "config"],
  data() {
    return {
      progressBar: null,
      progressBarContainer: null
    };
  },

  created() {
    this.initializeProgressBar();
  },

  computed: {
  },

  methods: {
    initializeProgressBar(){
      setTimeout(() => {
        this.progressBarContainer = document.querySelector(".progress")
        this.progressBar = document.querySelector(".progress__bar")
        this.setConfigProperties(this.config['details'])
        this.progressTo(this.startPercent)
      }, 200)
    },

    setConfigProperties(config){
      // for the container
      Object.assign(this.progressBarContainer.style, {
        background: `${config['empty_color']}`
      })

      // for the bar
      Object.assign(this.progressBar.style, {
        "background-color": `${config['progress_color']}`
      })
    },

    progressTo(progress) {
        Object.assign(this.progressBar.style, {
          width: `${progress}%`,
          "background-position-y": progress + "%"
        });
    }
  }
}
</script>

<style lang="scss" scoped>
.progress {
  width: 100%;
  height: 20px;
  background:#d3d3d3;
  position: relative;
}

.progress__bar {
  height: 100%;
  width: 0%;
  background-size: 100% 10000%;
  transition: width ease-in-out 0.8s;
  transform-origin: 0;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}

.progress-striped .progress__bar{
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
  background-color: #008000;
}
</style>