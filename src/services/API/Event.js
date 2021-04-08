import { apiClient } from "@/services/API/RootClient.js";
import { eventsEndpoint } from "@/services/API/Endpoints.js";

export default {
  createEvent(eventDetails) {
    // creates a new event
    return apiClient()
      .post(eventsEndpoint, eventDetails)
      .then((response) => {
        return response.data;
      });
  },
};
