// what should the minimum time difference
// between any two items (seconds)
const ITEM_VICINITY_TIME = 2;

export default {
  getItemTimestamps(items) {
    // returns the list of timestamps of the items
    let timestamps = [];

    items.forEach((item) => {
      timestamps.push(item.time);
    });

    return timestamps;
  },

  checkItemPopup(timestamp, itemTimestamps, popupPrecisionTime = 50) {
    // given current timestamp and list of item timestamps
    // check if an item should be popped

    // index of the item to be selected if any
    let selectedItemIndex = null;

    // checks if any item is to be marked selected for the given timestamp
    itemTimestamps.every((itemTimestamp, index) => {
      // if the seeker is within "POP_UP_PRECISION_TIME" of the
      // specific item time, then mark the item as selected
      if (
        timestamp < itemTimestamp &&
        timestamp >= itemTimestamp - popupPrecisionTime / 1000
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

  isTimestampValid(timestamp, itemTimestamps, itemIndex = null) {
    // loop through itemTimestamps to check if the time where the user
    // is trying to add/update an item is valid or not
    // using for loop instead of forEach as forEach was running async

    for (let index = 0; index < itemTimestamps.length; index++) {
      // don't check against the item itself
      if (itemIndex != null && index == itemIndex) continue;

      let val = itemTimestamps[index];

      // timestamp value should not be in range
      // [(val + ITEM_VICINITY_TIME), (val - ITEM_VICINITY_TIME)]
      if (
        timestamp <= val + ITEM_VICINITY_TIME &&
        timestamp >= val - ITEM_VICINITY_TIME
      )
        return false;
    }
    return true;
  },
};
