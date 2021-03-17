import { apiClient } from '@/services/RootApiClient.js'

export default {
  getPlioDetails(plioId, userId) {
    return apiClient().get(
      process.env.VUE_APP_BACKEND_PLIO_DETAILS +
      "?plioId=" + plioId +
      "&userId=" + userId
    )
  },

  getAllPlios() {
    return apiClient().get(
      process.env.VUE_APP_BACKEND_PLIOS_LIST
    )
  }
}