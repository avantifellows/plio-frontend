import { apiClient } from "@/services/API/RootClient.js";
import { imagesEndpoint, copyEndpoint } from "@/services/API/Endpoints.js";

export default {
  async uploadImage(imageFile) {
    // API to upload an image and create an image object in the DB
    let imageFormData = new FormData();
    imageFormData.append("url", imageFile);

    // set the content-type as `multipart/form-data` for the post request to go through
    apiClient().defaults.headers["Content-Type"] = "multipart/form-data";

    let response = await apiClient().post(imagesEndpoint, imageFormData);

    // reset the content type for other requests
    apiClient().defaults.headers["Content-Type"] = "application/json";

    return response;
  },

  deleteImage(imageId) {
    // API to soft delete an image entry in the DB. Also deletes the image on S3
    return apiClient().delete(imagesEndpoint + imageId);
  },
};
