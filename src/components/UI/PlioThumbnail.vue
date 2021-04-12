<template>
  <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
  <router-link
    :to="{ name: 'Player', params: { plioId: plio.uuid } }"
    tag="div"
    class="plio"
  >
    <div class="title">
      {{ plio.name }}
    </div>
    <div class="created_date">
      <i>{{ $t("home.plio_thumbnail.created") }}: </i> {{ plio.created_at }}
    </div>
    <div class="id">{{ $t("home.plio_thumbnail.id") }}: {{ plio.uuid }}</div>
  </router-link>
</template>

<script>
export default {
  name: "PlioThumbnail",
  props: ["plio"],
};
</script>

<style scoped>
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
</style>
