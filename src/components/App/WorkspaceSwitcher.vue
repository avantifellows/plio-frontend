<template>
  <div class="w-full">
    <select
      v-model="selectedWorkspace"
      @change="updateActiveWorkspace"
      data-test="select"
      class="rounded-md border-gray-400 focus:outline-none focus:border-gray-400 focus:ring-0 w-full text-sm sm:text-base"
      :disabled="isDisabled"
    >
      <option value="">Personal Workspace</option>
      <option
        v-for="workspace in workspaces"
        :key="workspace.id"
        :value="workspace.shortcode"
      >
        {{ workspace.name }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "WorkspaceSwitcher",
  computed: {
    ...mapState("auth", ["activeWorkspace", "user"]),
    workspaces() {
      return this.user ? this.user.organizations : [];
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
