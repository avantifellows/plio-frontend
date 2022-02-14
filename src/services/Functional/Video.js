export default {
  isYouTubeVideoLinkValid(link) {
    // checks if the youtube video link is valid
    let pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    let matches = link.match(pattern);
    if (matches) {
      return { valid: true, ID: matches[1] };
    }
    return { valid: false };
  },

  /**
   * extracts the video Id from the YouTube URL
   * @param {String} videoURL - the url of the youtube video whose id is to be extracted
   */
  getVideoIdfromURL(videoURL) {
    let linkValidation = this.isYouTubeVideoLinkValid(videoURL);
    if (!linkValidation["valid"]) return "";
    return linkValidation["ID"];
  },

  /**
   * Get the thumbnail image of a YouTube video
   * @param {String} videoId - the unique id of the video on youtube
   */
  getYouTubeVideoThumbnailURL(videoId) {
    return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  },
};
