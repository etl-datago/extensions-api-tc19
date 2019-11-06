"use strict";

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function() {
  let removeEventListener;
  let filteredColumns = [];

  // Use the jQuery document ready signal to know when everything has been initialized
  $(document).ready(function() {
    tableau.extensions.initializeAsync({ configure: showChooseSheetDialog }).then(function() {
      $('#reset_filters_button').click(resetFilters);
      const savedSheetName = tableau.extensions.settings.get('sheet');
      if (savedSheetName) {
        loadSelectedMarks(savedSheetName);
      } else {
        showChooseSheetDialog();
      }
    });
  });

  function showChooseSheetDialog() {
    const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
  
    const worksheetNames = worksheets.map((worksheet) => {
      return worksheet.name;
    });
  
    demoHelpers.showDialog(dashboardName, worksheetNames, saveSheetAndLoadSelectedMarks);
  }

  function loadSelectedMarks(worksheetName) {
    if (removeEventListener) {
      removeEventListener();
    }
    $('#selected_marks_title').text(worksheetName);
    const worksheet = demoHelpers.getSelectedSheet(worksheetName);
  
    worksheet.getSelectedMarksAsync().then((marks) => {
        demoHelpers.populateDataTable(marks, filterByColumn);
    });

    const marksSelectedEventHandler = (event) => {
      loadSelectedMarks(worksheetName);
    }
    removeEventListener = worksheet.addEventListener(
      tableau.TableauEventType.MarkSelectionChanged, marksSelectedEventHandler);    
  }

  function saveSheetAndLoadSelectedMarks(worksheetName) {
    tableau.extensions.settings.set('sheet', worksheetName);
    tableau.extensions.settings.saveAsync();
    loadSelectedMarks(worksheetName);
  }

  function filterByColumn(columnIndex, fieldName) {
    const columnValues = demoHelpers.getValuesInColumn(columnIndex);
    const worksheet = demoHelpers.getSelectedSheet(tableau.extensions.settings.get('sheet'));

    worksheet.applyFilterAsync(fieldName, columnValues, tableau.FilterUpdateType.Replace);

    filteredColumns.push(fieldName);
}

function resetFilters() {
  const worksheet = demoHelpers.getSelectedSheet(tableau.extensions.settings.get('sheet'));
  filteredColumns.forEach((columnName) => {
      worksheet.clearFilterAsync(columnName);
  });

  filteredColumns = [];
}
  
})();