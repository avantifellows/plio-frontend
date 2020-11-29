<template>
  <div class="container">
    <p class="emoji">&#128546;</p>

    <!-- 404 error starts -->
    <div v-if="isPageNotFound">
      <h2>आपसे गलत लिंक कॉपी हो गया है | आप वापस जाकर सही लिंक यहाँ कॉपी करके पेस्ट करिए | सहायता के लिए अपने टीचर से बात करें</h2>
      <h2>You have copied a wrong link. Please go back and copy the link again. Contact your teacher for help.</h2>
    </div>
    <!-- 404 error ends -->

    <!-- Browser error starts -->
    <div v-if="isBrowserError">

      <!-- TODO
      remove hardcoded link -> either parameterize it, or enter a link to youtube -->
      <div class="lead_text">
        <p>Plio को कैसे इस्तेमाल करना है, जानने के लिए ये video देखें </p>
      </div>
      <div class='embed-container'>
        <iframe src='https://www.youtube.com/embed/FLOwzot27XM' frameborder='0' allowfullscreen>
        </iframe>
      </div>

      <!-- failsafe begins -->
      <div v-if="hasFailSafe">

        <!-- TODO - Adding loading spinner till YT video loads -->
        <!-- failsafe G-form begins -->
        <div v-if="isFailSafeGform && isVideoIdFetched" >
          <hr class="solid">

          <div class="lead_text">
            <p>इसी प्रतियोगिता में Google फॉर्म से हिस्सा लेने के लिए नीचे दिया गया वीडियो देखें और उसके बाद Google फॉर्म का लिंक क्लिक करें </p>
            <div class='embed-container'>
              <iframe :src="this.value['youtubeId']" id="lesson-video" frameborder='0' allowfullscreen></iframe>
            </div>
            <br>
            <i class="far fa-hand-point-right"></i>
            <a
            :href=value.failsafeUrl
            class="icon-block" style="font-size:1.5em; width:3em;">
              लिंक
            </a>
            <i class="far fa-hand-point-left"></i>
            <hr class="solid">
          </div>
        </div>
        <!-- failsafe G-form ends -->

      </div>
      <!-- failsafe ends -->

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
    isVideoIdFetched() {
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