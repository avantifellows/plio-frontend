<template>
  <div class="w-full h-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-gray-700">
        {{ $t('settings.members.title') }}
      </h2>
      <button
        v-if="!isMobileScreen"
        @click="showAddMemberModal = true"
        class="flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        <inline-svg
          :src="getImageSource('plus.svg')"
          class="w-4 h-4 mr-2 fill-current"
        />
        {{ $t('settings.members.addMember') }}
      </button>
    </div>

    <div v-if="isMobileScreen" class="w-full p-3 mb-4 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
      Please access this members menu from a desktop or laptop screen.
    </div>

    <div v-if="!isMobileScreen">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center h-32">
      <inline-svg
        :src="getImageSource('spinner.svg')"
        class="w-8 h-8 animate-spin text-primary"
      />
      </div>

      <!-- Members table -->
      <div v-else-if="members.length > 0" class="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div class="overflow-y-auto" style="max-height: 60vh;">
          <table class="min-w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              {{ $t('settings.members.firstName') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              {{ $t('settings.members.lastName') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5 truncate">
              {{ $t('settings.members.email') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              {{ $t('settings.members.role') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              {{ $t('settings.members.actions') }}
            </th>
          </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span v-if="member.user && member.user.first_name" class="font-medium text-gray-900">
                {{ member.user.first_name }}
              </span>
              <span v-else class="italic text-gray-400">No Name</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span v-if="member.user && member.user.last_name" class="text-gray-500">
                {{ member.user.last_name }}
              </span>
              <span v-else class="italic text-gray-400">No Name</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm truncate">
              <span v-if="member.user && member.user.email" class="text-gray-500">
                {{ member.user.email }}
              </span>
              <span v-else-if="member.user && member.user.mobile" class="text-gray-500">
                {{ member.user.mobile }}
              </span>
              <span v-else class="italic text-gray-400">N/A</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(member.roleName)">
                {{ formatRoleName(member.roleName) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
              <button
                @click="confirmDeleteMember(member)"
                :disabled="!canDeleteMember(member)"
                class="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {{ $t('settings.members.confirmDelete.confirm') }}
              </button>
            </td>
          </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <inline-svg
          :src="getImageSource('users.svg')"
          class="w-12 h-12 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
        <p class="text-gray-500 mb-4">Add members to your organization to get started.</p>
        <button
          @click="showAddMemberModal = true"
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <inline-svg
            :src="getImageSource('plus.svg')"
            class="w-4 h-4 mr-2 fill-current"
          />
          {{ $t('settings.members.addMember') }}
        </button>
      </div>
    </div>

    <!-- Add Member Modal -->
    <AddMemberModal
      v-if="showAddMemberModal"
      @close="showAddMemberModal = false"
      @member-added="handleMemberAdded"
    />

    <!-- Delete Confirmation Modal -->
    <DialogBox
      v-if="memberToDelete"
      :title="$t('settings.members.confirmDelete.title')"
      :message="$t('settings.members.confirmDelete.message')"
      :confirmText="$t('settings.members.confirmDelete.confirm')"
      :cancelText="$t('settings.members.confirmDelete.cancel')"
      @confirm="deleteMember"
      @cancel="memberToDelete = null"
    />
  </div>
</template>

<script>
import UserAPIService from "@/services/API/User.js";
import AddMemberModal from "./AddMemberModal.vue";
import DialogBox from "@/components/UI/Alert/DialogBox.vue";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import { mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "MembersManager",
  components: {
    AddMemberModal,
    DialogBox,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      members: [],
      loading: true,
      showAddMemberModal: false,
      memberToDelete: null,
      rolesById: {},
      userCache: {},
    };
  },
  computed: {
    ...mapGetters({
      userRoleInActiveWorkspace: "auth/userRoleInActiveWorkspace",
      activeWorkspaceId: "auth/activeWorkspaceId",
    }),
    ...mapGetters("generic", ["isMobileScreen"]),
    currentUser() {
      return this.$store.state.auth?.user || null;
    },
  },
  async mounted() {
    await this.loadMembers();
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,

    async ensureRolesLoaded() {
      if (this.rolesById && Object.keys(this.rolesById).length > 0) return;
      try {
        const rolesResp = await UserAPIService.getRoles();
        const roles = rolesResp.data.results || rolesResp.data || [];
        this.rolesById = roles.reduce((acc, r) => {
          acc[r.id] = r.name;
          return acc;
        }, {});
      } catch (e) {
        // fallback
        this.rolesById = this.rolesById || {};
      }
    },

    async loadMembers() {
      try {
        this.loading = true;
        await this.ensureRolesLoaded();
        const response = await UserAPIService.getOrganizationUsers(this.activeWorkspaceId);
        const rawMembers = response.data.results || response.data || [];

        // cache user fetches to avoid duplicate requests
        if (!this.userCache) this.userCache = {};
        const normalized = [];

        for (let m of rawMembers) {
          // Prefer embedded user_details if provided by API
          let userObj = m.user_details || m.user;
          if (!userObj || typeof userObj === 'number') {
            const userId = typeof userObj === 'number' ? userObj : m.user;
            if (!this.userCache[userId]) {
              try {
                const userResponse = await UserAPIService.getUserById(userId);
                this.userCache[userId] = userResponse.data;
              } catch (error) {
                console.error('Failed to fetch user details:', error);
                this.userCache[userId] = null;
              }
            }
            userObj = this.userCache[userId];
          }

          const roleId = typeof m.role === 'number' ? m.role : m.role?.id;
          const roleName = this.rolesById?.[roleId] || (typeof m.role === 'string' ? m.role : 'org-view');

          normalized.push({
            ...m,
            user: userObj,
            roleId,
            roleName,
          });
        }

        // Fallback client-side filter if API couldn't filter
        const activeOrgId = this.activeWorkspaceId;
        this.members = normalized.filter(m => !activeOrgId || m.organization === activeOrgId || m.organization?.id === activeOrgId);
      } catch (error) {
        console.error("Failed to load members:", error);
        this.toast.error("Failed to load members");
      } finally {
        this.loading = false;
      }
    },

    async handleMemberAdded() {
      this.showAddMemberModal = false;
      await this.loadMembers();
      this.toast.success(this.$t('settings.members.addMemberModal.success'));
    },

    confirmDeleteMember(member) {
      this.memberToDelete = member;
    },

    async deleteMember() {
      if (!this.memberToDelete) return;

      try {
        await UserAPIService.deleteOrganizationUser(this.memberToDelete.id);
        await this.loadMembers();
        this.toast.success("Member removed successfully");
      } catch (error) {
        console.error("Failed to delete member:", error);
        this.toast.error("Failed to remove member");
      } finally {
        this.memberToDelete = null;
      }
    },

    canDeleteMember(member) {
      if (!member) return false;
      // Don't allow deletion of current user (only if we know the user id)
      if (this.currentUser && member.user && member.user.id === this.currentUser.id) {
        return false;
      }

      const roleName = member.roleName || member.role?.name;

      // Super-admins can delete org-admins and org-view users
      if (this.userRoleInActiveWorkspace === "super-admin") {
        return ["org-admin", "org-view"].includes(roleName);
      }

      // Org-admins can only delete org-view users
      if (this.userRoleInActiveWorkspace === "org-admin") {
        return roleName === "org-view";
      }

      return false;
    },

    getRoleBadgeClass(roleName) {
      switch (roleName) {
        case "super-admin":
          return "bg-red-100 text-red-800";
        case "org-admin":
          return "bg-blue-100 text-blue-800";
        case "org-view":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },

    formatRoleName(roleName) {
      switch (roleName) {
        case "super-admin":
          return "Super Admin";
        case "org-admin":
          return "Organization Admin";
        case "org-view":
          return "Viewer";
        default:
          return roleName;
      }
    },
  },
};
</script>