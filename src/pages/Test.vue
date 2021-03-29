<template>
  <div>
    <dialog-box
      title="Are you sure you want to leave?"
      @confirm="confirmClicked"
    ></dialog-box>
  </div>
</template>

<script>
import DialogBox from "@/components/UI/Alert/DialogBox";
export default {
  components: {
    DialogBox,
  },
  methods: {
    confirmClicked() {
      console.log("confirm");
    },
  },
};
</script>
