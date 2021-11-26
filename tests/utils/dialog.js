import store from "@/store";

global.simulateConfirmClick = async () => {
  // simulate clicking the confirm button of the dialog box
  await store.dispatch("dialog/hideDialogBox");
  await store.dispatch("dialog/unsetDialogTitle");
  await store.dispatch("dialog/unsetDialogDescription");
  await store.dispatch("dialog/unsetConfirmButtonConfig");
  await store.dispatch("dialog/unsetCancelButtonConfig");
  await store.dispatch("dialog/unsetDialogBoxClass");
  await store.dispatch("dialog/unsetDialogCloseButton");
  await store.dispatch("dialog/setConfirmClicked");
};

global.simulateCancelClick = async () => {
  // simulate clicking the cancel button of the dialog box
  await store.dispatch("dialog/hideDialogBox");
  await store.dispatch("dialog/unsetDialogTitle");
  await store.dispatch("dialog/unsetDialogDescription");
  await store.dispatch("dialog/unsetConfirmButtonConfig");
  await store.dispatch("dialog/unsetCancelButtonConfig");
  await store.dispatch("dialog/unsetDialogBoxClass");
  await store.dispatch("dialog/unsetDialogCloseButton");
  await store.dispatch("dialog/setCancelClicked");
};
