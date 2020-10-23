<template>
<router-link :to="'/play/' +  ivideo.object_id" tag="div" class="ivideo">
  <div class="title">
    {{ ivideo.title }}
  </div>
  <div class="created_date"><i>Created: </i> {{ ivideo.created }}</div>
  <div class="id">ID: {{ ivideo.object_id }}</div>
</router-link>
</template>

<script>

export default {
    name: "IvideoThumbnail",
    props: ["ivideo"],
};
</script>

<style scoped>
.ivideo {
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