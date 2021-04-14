<template>
  <div class="border rounded-sm p-2">
    <div class="animate-pulse grid grid-flow-row auto-rows-min gap-5">
      <div class="flex flex-row justify-start gap-3">
        <p class="h-3 place-self-center w-1/3 bg-yellow-500 rounded-md"></p>
        <p class="h-3 place-self-center w-1/3 bg-yellow-500 rounded-md"></p>
      </div>
      <div class="h-6 w-full rounded-md bg-yellow-500"></div>
      <div class="h-2 w-full rounded-md bg-yellow-500"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlioListItemSkeleton",
};
</script>
