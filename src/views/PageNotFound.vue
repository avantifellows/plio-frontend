<template>
  <div class="container">
    <!-- 404 error starts -->
    <div v-if="isPageNotFound">
      <h1>404</h1>
      <p>You have visited a wrong link</p>
      <p>आप गलत लिंक पर आ गए हैं</p>
    </div>
    <!-- 404 error ends -->

    <!-- Browser error starts -->
    <div v-if="isBrowserError">

      <div class="lead_text" >
        <p>यह वेबसाइट सिर्फ Google Chrome पे चलेगी </p>
        <p>This website will only work on Google Chrome</p>
      </div>
      <a 
        href="https://play.google.com/store/apps/details?id=com.android.chrome"
        class="icon-block">
        <img src="../assets/chrome.svg">
      </a>
      <div class="lead_text" style="font-size:1em">
        <p>ऊपर click करके Google Chrome download करें</p>
        <p>या फिर</p>
        <p>Link कॉपी करके Google Chrome में खोलें</p>
      </div>

    </div>
    <!-- Browser error ends -->

  </div>
</template>

<script>
export default {
  name: "PageNotFound",
  props: ['type', 'value'],
  
  created() {
    document.getElementById('nav').style.display = "none";
    console.log(this.type)
  },

  computed: {
    isPageNotFound() {
      return this.type === '404'
    },
    isBrowserError() {
      return this.type === 'browser-error'
    }
  }
}
</script>

<style scoped>
.container {
    max-width: 1100px;
    margin: auto;
    overflow: auto;
    padding: 0 2 rem;
}

.lead_text {
    font-size: 1.4em;
    font-weight: bold;
}

a.icon-block {
    display:inline-block;
    width:10em;
    float:center;
    text-align:center;
}

/* divider */
hr.solid {
  border-top: 3px solid #bbb;
}
</style>