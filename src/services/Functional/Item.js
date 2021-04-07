export default {
  getItemTimestamps(items) {
    // returns the list of timestamps of the items
    var timestamps = [];

    items.forEach((item) => {
      timestamps.push(item.time);
    });

    return timestamps;
  },

  checkItemPopup(timestamp, itemTimestamps) {
    // given current timestamp and list of item timestamps
    // check if an item should be popped

    // How precisely should the question pop-up logic
    // be measured. Time in milliseconds
    const POP_UP_PRECISION_TIME = 50;

    // index of the item to be selected if any
    var selectedItemIndex = -1;

    // checks if any item is to be marked selected for the given timestamp
    itemTimestamps.every((itemTimestamp, index) => {
      // if the seeker is within "POP_UP_PRECISION_TIME" of the
      // specific item time, then mark the item as selected
      if (
        timestamp < itemTimestamp &&
        timestamp >= itemTimestamp - POP_UP_PRECISION_TIME / 1000
      ) {
        // mark that some item has been selected at this timestamp
        selectedItemIndex = index;
        // breaks the loop
        return false;
      } else {
        // go on to check the next item
        return true;
      }
    });
    return selectedItemIndex;
  },
};
