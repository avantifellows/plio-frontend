<template>
  <div class="container">
    <p style="font-size:5em">&#128546;</p>

    <!-- 404 error starts -->
    <div v-if="isPageNotFound">
      <h2>आपसे गलत लिंक कॉपी हो गया है | आप वापस जाकर सही लिंक यहाँ कॉपी करके पेस्ट करिए | लिंक कुछ ऐसा दिखेगा:</h2>
      <h2 style="color:blue">https://player.plio.in/#/play/adndmidoe</h2>
      <h2>You have copied a wrong link. Please go back and copy the link again. The link would look something like this:</h2>
      <h2 style="color:blue">https://player.plio.in/#/play/adndmidoe</h2>
    </div>
    <!-- 404 error ends -->

    <!-- Browser error starts -->
    <div v-if="isBrowserError">
      <!-- failsafe begins -->
      <div v-if="hasFailSafe">

        <!-- failsafe G-form begins -->
        <div v-if="isFailSafeGform">
          <div class="lead_text">
            <p>इसी प्रतियोगिता में Google फॉर्म से हिस्सा लेने के लिए नीचे बटन पे क्लिक करें</p>
            <a
              :href=value.failsafe_url
              class="icon-block">
              <img src="../assets/google_form.svg">
            </a>
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
  },

  computed: {
    isPageNotFound() {
      return this.type === '404'
    },
    isBrowserError() {
      return this.type === 'browser_error'
    },
    hasFailSafe() {
      return !!this.value['failsafe_url']
    },
    isFailSafeGform() {
      return this.value['failsafe_type'] === 'g-form'
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