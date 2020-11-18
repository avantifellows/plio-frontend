<template>
<router-link :to="'/play/' +  plio.plio_id" tag="div" class="plio">
  <div class="title">
    {{ plio.title }}
  </div>
  <div class="created_date"><i>Created: </i> {{ plio.created }}</div>
  <div class="id">ID: {{ plio.plio_id }}</div>
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