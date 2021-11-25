import { apiClient } from "@/services/API/RootClient.js";
import { eventsEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   * @param {Object} eventData - The data that will be used as a payload
   */
  createEvent(eventData) {
    // creates a new event
    return apiClient()
      .post(eventsEndpoint, eventData)
      .then((response) => {
        return response.data;
      });
  },
  /**
   * @param {Number} eventId - The ID of the event that needs to be updated
   * @param {Object} eventData - The data that will be used as a payload
   */
  updateEvent(eventId, eventData) {
    return apiClient().put(eventsEndpoint + eventId, eventData);
  },
};
