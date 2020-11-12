<template>
  <div class="container">

    <div class="lead_text">
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

    <div class="lead_text" v-if="!!failsafe">
      <hr class="solid">
      <p>Google Form प्रतियोगिता देने के लिए नीचे click करें</p>
      <a
        :href=failsafe
        class="icon-block">
        <img src="../assets/google_form.svg">
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Error",
  props: ["failsafe"],
  
  created() {
    document.getElementById('nav').style.display = "none";
    console.log("failsafe -- " + this.failsafe)
  },
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