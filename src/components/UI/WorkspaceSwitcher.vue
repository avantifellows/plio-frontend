<template>
  <div>
    <select v-model="selectedWorkspace" @change="this.updateActiveWorkspace">
      <option value="">Personal Workspace</option>
      <option v-for="workspace in this.workspaces" :key="workspace.id" :value="workspace.shortcode">{{workspace.name}}</option>
    </select>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "WorkspaceSwitcher",
  computed: {
    ...mapState('auth', ["activeWorkspace", "user"]),
    workspaces() {
        return this.user ? this.user.organizations : [];
    },
  },
  data() {
    return {
      selectedWorkspace: "",
    }
  },
  methods: {
    ...mapActions('auth', ['setActiveWorkspace']),
    updateActiveWorkspace() {
      this.setActiveWorkspace(this.selectedWorkspace);
      this.$router.push({name: 'Home', params: { org: this.activeWorkspace }});
    }
  },
  mounted() {
    this.selectedWorkspace = this.activeWorkspace;
  }
};
</script>
