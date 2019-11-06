
    let filteredColumns = [];

    function filterByColumn(columnIndex, fieldName) {
      const columnValues = demoHelpers.getValuesInColumn(columnIndex);
      const worksheet = demoHelpers.getSelectedSheet(tableau.extensions.settings.get('sheet'));

      worksheet.applyFilterAsync(fieldName, columnValues, tableau.FilterUpdateType.Replace);

      filteredColumns.push(fieldName);
  }
