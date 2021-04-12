export default {
  isYouTubeVideoLinkValid(link) {
    // checks if the youtube video link is valid
    var pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    var matches = link.match(pattern);
    if (matches) {
      return { valid: true, ID: matches[1] };
    }
    return { valid: false };
  },
};
