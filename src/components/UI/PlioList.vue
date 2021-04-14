<template>
  <div>
    <h3>{{ $t("home.plio_list_heading") }}</h3>
    <div class="plios">
      <div v-for="plio in allPlios" :key="plio.id" class="plios">
        <PlioThumbnail :plio="plio" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import PlioThumbnail from "@/components/UI/PlioThumbnail.vue";

export default {
  name: "PlioList",
  components: {
    PlioThumbnail,
  },
  // namespaced helpers
  // https://vuex.vuejs.org/guide/modules.html#binding-helpers-with-namespace
  computed: {
    ...mapState("plioItems", ["allPlios"]),
    ...mapState("auth", ["activeWorkspace"]),
  },
  methods: mapActions("plioItems", ["fetchPlios"]),
  created() {
    this.fetchPlios();
  },
  watch: {
    activeWorkspace() {
      this.fetchPlios();
    },
  },
};
</script>

<style scoped>
.plios {
  display: grid;
  margin: auto;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-gap: 1rem;
}

.plio {
  color: white;
  border: 1px solid #ccc;
  background: #cc593d;
  padding: 2rem;
  border-radius: 5px;
  text-align: center;
  position: relative;
  cursor: pointer;
  text-decoration: none;
}

.plio a {
  text-decoration: none;
  color: white;
}

.plio a:visited {
  text-decoration: none;
  color: white;
}
</style>
