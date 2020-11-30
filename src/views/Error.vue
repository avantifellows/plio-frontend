<template>
  <div class="container">

    <!-- 404 error starts -->
    <div v-if="isPageNotFound">
      <h2>आपसे गलत लिंक कॉपी हो गया है | आप वापस जाकर सही लिंक यहाँ कॉपी करके पेस्ट करिए | सहायता के लिए अपने टीचर से बात करें</h2>
      <h2>You have copied a wrong link. Please go back and copy the link again. Contact your teacher for help.</h2>
    </div>
    <!-- 404 error ends -->

    <!-- Browser error starts -->
    <div v-if="isBrowserError">

      <div v-if="isVideoIdAvailable">

        <!-- The lesson video in a YT iframe -->
        <div class="lead_text">
          <div class='embed-container'>
            <iframe :src="this.value['youtubeId']" id="lesson-video" frameborder='0' allowfullscreen></iframe>
          </div>
        </div>

        <!-- failsafe begins -->
        <div v-if="hasFailSafe">

          <!-- failsafe G-form begins -->
          <div v-if="isFailSafeGform" >
            <hr class="solid">

            <div class="lead_text">
              <p>ऊपर दिया गया वीडियो देखें और उसके बाद Google फॉर्म के लिंक पे जाके प्रश्न करें</p>
              <br>
              <i class="far fa-hand-point-right"></i>
              <a
              :href=value.failsafeUrl
              class="icon-block" style="font-size:5vw; width:72vw;">
                https://www.form.google.com
              </a>
              <i class="far fa-hand-point-left"></i>
              <hr class="solid">
            </div>
          </div>
          <!-- failsafe G-form ends -->

        </div>

        <div v-else>
          <hr class="solid">

          <div class="lead_text">
            <p>ऊपर दिया गया वीडियो देखें</p>
          </div>        
        </div>
        <!-- failsafe ends -->
      </div>

      <!-- TODO
      remove hardcoded link -> either parameterize it, or enter a link to youtube -->
      <div class="lead_text">
        <p>Plio कैसे इस्तेमाल करना है, यह जानने के लिए यह video देखें </p>
      </div>
      <div class='embed-container'>
        <iframe :src='plioTutorialYT' frameborder='0' allowfullscreen> </iframe>
      </div>

      <hr class="solid">
      <br>

      <p class="emoji">&#128546;</p>
      <div class="lead_text" >
        <p>यह वेबसाइट सिर्फ Google Chrome पे चलेगी </p>
        <p>This website will only work on Google Chrome</p>
      </div>
      <a 
        href="https://play.google.com/store/apps/details?id=com.android.chrome"
        class="icon-block">
        <img src="../assets/chrome.svg">
      </a>
      <div class="lead_text">
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

  data() {
    return {
      plioTutorialYT: "https://www.youtube.com/embed/FLOwzot27XM"
    };
  },
  
  created() {
    document.getElementById('nav').style.display = "none";
  },

  computed: {
    isPageNotFound() {
      return this.type === '404'
    },
    isBrowserError() {
      return this.type === 'browser_error'
    },
    hasFailSafe() {
      return !!this.value['failsafeUrl']
    },
    isFailSafeGform() {
      return this.value['failsafeType'] === 'g-form'
    },
    isVideoIdAvailable() {
      return !!this.value['youtubeId']
    }
  }
}
</script>

<style scoped>

.embed-container { 
  position: relative; 
  padding-bottom: 56.25%; 
  height: 0; 
  overflow: hidden; 
  max-width: 100%; 
} 

.embed-container iframe, 
.embed-container object, 
.embed-container embed {
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
}



.container {
    max-width: 1100px;
    margin: auto;
    overflow: auto;
    padding: 0 2 rem;
}

.emoji {
  font-size: 2em
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