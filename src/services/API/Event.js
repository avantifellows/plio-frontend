import { apiClient } from "@/services/API/RootClient.js";
import { eventsEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   *
   * @param {Object} eventData - The data that will be used as a payload in the POST request
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
   *
   * @param {Number} eventId - The ID of the event that needs to be patched
   * @param {Object} eventData - The event will be patched with this data
   */
  updateEvent(eventId, eventData) {
    return apiClient().patch(eventsEndpoint + eventId, eventData);
  },
};
