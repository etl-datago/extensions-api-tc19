"use strict";

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function() {

  let removeEventListener;

  let filteredColumns = [];

  // Quando o documento HTML é carregado. Carregue:
  $(document).ready(function() {
    tableau.extensions.initializeAsync({'configure': showChooseSheetDialog}).then(function() {
      // $("#test").append("I have initialized!");   // Funçao de inicializar
      //showChooseSheetDialog();
      
      //Ação do botão
      $('#reset_filters_button').click(resetFilters);
      $('#show_choose_sheet_button').click(showChooseSheetDialog);
    
      const savedSheetName = tableau.extensions.settings.get('sheet');
      if (savedSheetName) {
        loadSelectedMarks(savedSheetName);
      } else {
        showChooseSheetDialog();
      }

    });
    
    function showChooseSheetDialog() {
      //obtem nome do Dashboard
      const dashboardName = tableau.extensions.dashboardContent.dashboard.name;

      //obtem vetor do nome das planilhas
      const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
      
      //trata para pegar apenas os dashboards
      const worksheetNames = worksheets.map((worksheet) => {
        return worksheet.name;
      });
      
      //resposta
      demoHelpers.showDialog(dashboardName, worksheetNames, saveSheetAndLoadSelectedMarks);
    }

    // carregar marcados
    function loadSelectedMarks(worksheetName) {
      if (removeEventListener) {
        removeEventListener();
      }

      //Texto para omarcas selecionada
      $('#selected_marks_title').text(worksheetName);

      //Obtem nome marcas selecionada
      const worksheet = demoHelpers.getSelectedSheet(worksheetName);
      
      // Obtem todas as marcas selecionadas
      worksheet.getSelectedMarksAsync().then((marks) => {
          //Popular datatable
          demoHelpers.populateDataTable(marks, filterByColumn);
      });
      
      // obtem marcas selecionadas assincronas      
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

    // ao clicar na coluna, ira filtrar dados por coluna
    function filterByColumn(columnIndex, fieldName) {
      //obtem valores da coluna
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





  });
})();