<template>
  <router-link :to="{ name: 'Player', params: { id: plio.plio_id } }" tag="div" class="plio">
    <div class="title">
      {{ plio.title }}
    </div>
    <div class="created_date">
      <i>{{ $t("home.plio_thumbnail.created") }}: </i> {{ plio.created }}
    </div>
    <div class="id">{{ $t("home.plio_thumbnail.id") }}: {{ plio.plio_id }}</div>
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
