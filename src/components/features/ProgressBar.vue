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
      this.setCSSProperties(config)
    },

    setCSSProperties(config){
      let root = document.documentElement;
      root.style.setProperty('--empty-color', config['empty_color'])
      root.style.setProperty('--progress-color', config['progress_color'])
    },

    progressTo(progress) {
      let root = document.documentElement;
      root.style.setProperty('--progress-percent', progress + "%")
      root.style.setProperty('--background-position-y', progress + "%")
    }
  }
}
</script>

<style lang="scss" scoped>
:root {
  --empty-color: #000000;
  --progress-color: #FFFFFF;
  --progress-percent: 0%;
  --background-position-y: 0%;
}
.progress {
  width: 100%;
  height: 20px;
  background: var(--empty-color);
  position: relative;
}

.progress__bar {
  height: 100%;
  width: var(--progress-percent);
  background-size: 100% 10000%;
  transition: width ease-in-out 0.8s;
  transform-origin: 0;
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  background-position-y: var(--background-position-y);
}

.progress-striped .progress__bar{
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
  background-size: 40px 40px;
  background-color: var(--progress-color);
}
</style>