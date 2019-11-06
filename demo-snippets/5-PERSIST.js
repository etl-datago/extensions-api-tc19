


function saveSheetAndLoadSelectedMarks(worksheetName) {
  tableau.extensions.settings.set('sheet', worksheetName);
  tableau.extensions.settings.saveAsync();
  loadSelectedMarks(worksheetName);
}

  const savedSheetName = tableau.extensions.settings.get('sheet');
  if (savedSheetName) {
    loadSelectedMarks(savedSheetName);
  } else {
    showChooseSheetDialog();
  }


