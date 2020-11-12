<template>
  <div>
    <h3>Plios</h3>
    <div class="ivideos">
        
        <div v-for="ivideo in allIvideos" :key="ivideo.object_id" class="ivideos">
            <IvideoThumbnail v-bind:ivideo="ivideo"  />
        </div>
    </div>
  </div>
</template>


<script>

import { mapGetters, mapActions } from 'vuex';
import IvideoThumbnail from './IvideoThumbnail.vue';


export default {
  name: "IvideoList",
  components: {
      IvideoThumbnail,
  },
  computed: mapGetters(['allIvideos']),
  methods: {
      ...mapActions(['fetchIvideos'])
  },
  created() {
      this.fetchIvideos();
  }
};
</script>

<style scoped>
.ivideos {
    display: grid;
    margin: auto;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-gap: 1rem;
}

    .ivideo {
        color:white;
        border: 1px solid #ccc;
        background: #CC593D;
        padding: 2rem;
        border-radius: 5px;
        text-align: center;
        position: relative;
        cursor: pointer;
        text-decoration: none;
    }

    .ivideo a {
        text-decoration: none;
        color: white;
    }

    .ivideo a:visited {
        text-decoration: none;
        color: white;
    }
</style>