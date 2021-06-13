import { apiClient } from "@/services/API/RootClient.js";
import { imagesEndpoint } from "@/services/API/Endpoints.js";

export default {
  async uploadImage(imageFile) {
    // API to upload an image and create an image object in the DB
    var bodyFormData = new FormData();
    bodyFormData.append("url", imageFile);

    apiClient().defaults.headers["Content-Type"] = "multipart/form-data";

    var response = await apiClient().post(imagesEndpoint, bodyFormData);

    apiClient().defaults.headers["Content-Type"] = "application/json";

    return response;
  },

  deleteImage(imageId) {
    // API to soft delete an image entry in the DB. Also deletes the image on S3
    return apiClient().delete(imagesEndpoint + imageId);
  },
};
