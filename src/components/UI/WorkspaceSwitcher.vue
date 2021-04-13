<template>
  <div>
    <select v-model="selectedWorkspace" @change="this.updateActiveWorkspace">
      <option value="">Personal Workspace</option>
      <option v-for="workspace in this.user.organizations" :key="workspace.id" :value="workspace.shortcode">{{workspace.name}}</option>
    </select>
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "WorkspaceSwitcher",
  computed: {
      ...mapState('auth', ["activeWorkspace", "user"]),
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
  created() {
    this.selectedWorkspace = this.activeWorkspace;
  }
};
</script>
