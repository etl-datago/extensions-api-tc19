
function loadSelectedMarks(worksheetName) {
  $('#selected_marks_title').text(worksheetName);
  const worksheet = demoHelpers.getSelectedSheet(worksheetName);

  worksheet.getSelectedMarksAsync().then((marks) => {
      demoHelpers.populateDataTable(marks);
  });
}