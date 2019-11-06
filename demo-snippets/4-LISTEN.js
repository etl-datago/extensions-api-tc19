
let removeEventListener;

if (removeEventListener) {
  removeEventListener();
}

const marksSelectedEventHandler = (event) => {
  loadSelectedMarks(worksheetName);
}
removeEventListener = worksheet.addEventListener(
  tableau.TableauEventType.MarkSelectionChanged, marksSelectedEventHandler);
