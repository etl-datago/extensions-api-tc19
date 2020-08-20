"use strict";

// Wrap everything in an anonymous function to avoid poluting the global namespace
(function() {

  // Quando o documento HTML é carregado. Carregue:
  $(document).ready(function() {
    tableau.extensions.initializeAsync({'configure': showChooseSheetDialog}).then(function() {
      // $("#test").append("I have initialized!");   // Funçao de inicializar
      showChooseSheetDialog();
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
      demoHelpers.showDialog(dashboardName, worksheetNames, loadSelectedMarks);
    }



    function loadSelectedMarks(worksheetName) {
      //Texto para omarcas selecionada
      $('#selected_marks_title').text(worksheetName);

      //Obtem nome marcas selecionada
      const worksheet = demoHelpers.getSelectedSheet(worksheetName);
      
      // Obtem todas as marcas selecionadas
      worksheet.getSelectedMarksAsync().then((marks) => {
          //Popular datatable
          demoHelpers.populateDataTable(marks);
      });
    }







    

  });
})();