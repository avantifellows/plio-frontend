<template>
  <div class="shadow p-4 m-2 sm:m-4">
    <div class="animate-pulse flex flex-col">
      <div
        class="flex justify-center bg-gray-600 w-full h-32 bp-420:h-40 sm:h-64 md:h-80 lg:h-96 mb-4"
      ></div>
      <div class="h-4 bg-gray-400 rounded"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VideoSkeleton",
};
</script>
