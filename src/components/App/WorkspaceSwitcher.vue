<template>
  <div class="w-full">
    <select
      v-model="selectedWorkspace"
      @change="updateActiveWorkspace"
      data-test="select"
      class="rounded-md border-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 w-full text-lg bp-500:text-base"
      :disabled="isDisabled"
    >
      <option value="">Personal Workspace</option>
      <option
        v-for="(workspace, index) in workspaces"
        :key="workspace.id"
        :value="workspace.shortcode"
        :data-test="`workspace-${index}`"
      >
        {{ workspace.name }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  name: "WorkspaceSwitcher",
  computed: {
    ...mapState("auth", ["activeWorkspace", "user"]),
    ...mapGetters("auth", ["workspaces"]),
  },
  watch: {
    activeWorkspace(value) {
      this.selectedWorkspace = value;
    },
  },
  props: {
    /** whether the switcher is disabled */
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedWorkspace: "",
    };
  },
  methods: {
    ...mapActions("auth", ["setActiveWorkspace"]),
    updateActiveWorkspace() {
      this.$mixpanel.register({
        "Current Workspace": this.selectedWorkspace,
      });
      this.$mixpanel.people.set({
        "Current Workspace": this.selectedWorkspace,
      });
      this.setActiveWorkspace(this.selectedWorkspace);
      this.$router.push({ name: "Home", params: { org: this.activeWorkspace } });
    },
  },
  mounted() {
    this.selectedWorkspace = this.activeWorkspace;
  },
};
</script>
