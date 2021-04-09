import { apiClient } from "@/services/API/RootClient.js";
import { eventsEndpoint } from "@/services/API/Endpoints.js";

export default {
  createEvent(eventData) {
    // creates a new event
    return apiClient()
      .post(eventsEndpoint, eventData)
      .then((response) => {
        return response.data;
      });
  },
};
