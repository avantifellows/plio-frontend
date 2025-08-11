<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.stop>
    <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ $t('settings.members.addMemberModal.title') }}
          </h3>
          <button
            @click.stop.prevent="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <inline-svg
              :src="getImageSource('times-solid.svg')"
              class="w-6 h-6"
            />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('settings.members.addMemberModal.fields.firstName') }}
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              :placeholder="$t('settings.members.addMemberModal.placeholders.firstName')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.firstName }"
            />
            <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">
              {{ errors.firstName }}
            </p>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('settings.members.addMemberModal.fields.lastName') }}
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              :placeholder="$t('settings.members.addMemberModal.placeholders.lastName')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.lastName }"
            />
            <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">
              {{ errors.lastName }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('settings.members.addMemberModal.fields.email') }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="$t('settings.members.addMemberModal.placeholders.email')"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">
              {{ errors.email }}
            </p>
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('settings.members.addMemberModal.fields.role') }}
            </label>
            <select
              id="role"
              v-model="form.roleId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              :class="{ 'border-red-500': errors.role }"
            >
              <option value="">{{ $t('settings.members.addMemberModal.placeholders.role') }}</option>
              <option
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.id"
              >
                {{ formatRoleName(role.name) }}
              </option>
            </select>
            <p v-if="errors.role" class="text-red-500 text-xs mt-1">
              {{ errors.role }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click.stop.prevent="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {{ $t('settings.members.addMemberModal.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submitting || !isFormFilled"
              class="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <inline-svg
                v-if="submitting"
                :src="getImageSource('spinner.svg')"
                class="w-4 h-4 mr-2 animate-spin"
              />
              {{ $t('settings.members.addMemberModal.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import UserAPIService from "@/services/API/User.js";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import { mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  name: "AddMemberModal",
  emits: ["close", "member-added"],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        roleId: "",
      },
      errors: {},
      submitting: false,
      availableRoles: [],
    };
  },
  computed: {
    ...mapGetters({
      userRoleInActiveWorkspace: "auth/userRoleInActiveWorkspace",
      activeWorkspaceId: "auth/activeWorkspaceId",
    }),
    isFormFilled() {
      return (
        this.form.firstName.trim() &&
        this.form.lastName.trim() &&
        this.form.email.trim() &&
        this.form.roleId
      );
    },
  },
  async mounted() {
    await this.loadRoles();
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,

    async loadRoles() {
      try {
        const response = await UserAPIService.getRoles();
        const allRoles = response.data.results || response.data || [];
        // Use roles from API but exclude super-admin from assignment list
        this.availableRoles = allRoles.filter(r => r.name !== "super-admin");
      } catch (error) {
        console.error("Failed to load roles:", error);
        this.toast.error("Failed to load available roles");
      }
    },


    validateForm() {
      this.errors = {};

      if (!this.form.firstName.trim()) {
        this.errors.firstName = this.$t('settings.members.addMemberModal.validation.firstNameRequired');
      }

      if (!this.form.lastName.trim()) {
        this.errors.lastName = this.$t('settings.members.addMemberModal.validation.lastNameRequired');
      }

      if (!this.form.email.trim()) {
        this.errors.email = this.$t('settings.members.addMemberModal.validation.emailRequired');
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = this.$t('settings.members.addMemberModal.validation.emailInvalid');
      }

      if (!this.form.roleId) {
        this.errors.role = this.$t('settings.members.addMemberModal.validation.roleRequired');
      }

      return Object.keys(this.errors).length === 0;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      this.submitting = true;

      try {
        // First, check if user already exists by email
        let userId;
        let userExists = false;

        try {
          const existingUserResponse = await UserAPIService.getUserByEmail(this.form.email);
          if (existingUserResponse.data && existingUserResponse.data.results && existingUserResponse.data.results.length > 0) {
            userId = existingUserResponse.data.results[0].id;
            userExists = true;
          }
        } catch (error) {
          // User doesn't exist, we'll create one
          userExists = false;
        }

        // Create user if they don't exist
        if (!userExists) {
          const userData = {
            first_name: this.form.firstName.trim(),
            last_name: this.form.lastName.trim(),
            email: this.form.email.trim(),
            password: this.generateRandomPassword(), // Generate a random password
            status: "approved",
          };

          try {
            const createUserResponse = await UserAPIService.createUser(userData);
            userId = createUserResponse.data.id;
          } catch (error) {
            // If email already exists, fetch the user's id and continue
            if (
              error.response &&
              error.response.status === 400 &&
              error.response.data &&
              error.response.data.email
            ) {
              const emailErrors = error.response.data.email;
              const alreadyExists =
                Array.isArray(emailErrors) &&
                emailErrors.join(" ").toLowerCase().includes("already exists");
              if (alreadyExists) {
                const existingUserResponse = await UserAPIService.getUserByEmail(this.form.email);
                const results = existingUserResponse.data.results || existingUserResponse.data || [];
                if (Array.isArray(results) && results.length > 0) {
                  userId = results[0].id;
                } else {
                  throw error;
                }
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }
        }

        // Now create the organization membership
        const membershipData = {
          user: userId,
          organization: this.activeWorkspaceId,
          role: this.form.roleId,
        };

        await UserAPIService.createOrganizationUser(membershipData);

        // Emit success event
        this.$emit("member-added");
      } catch (error) {
        console.error("Failed to add member:", error);
        
        if (error.response && error.response.status === 400) {
          const errorData = error.response.data;
          if (errorData.non_field_errors && errorData.non_field_errors.includes("organization user with this User and Organization already exists.")) {
            this.toast.error(this.$t('settings.members.addMemberModal.errors.userExists'));
          } else {
            this.toast.error(this.$t('settings.members.addMemberModal.errors.general'));
          }
        } else {
          this.toast.error(this.$t('settings.members.addMemberModal.errors.general'));
        }
      } finally {
        this.submitting = false;
      }
    },

    generateRandomPassword() {
      // Generate a secure random password
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
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