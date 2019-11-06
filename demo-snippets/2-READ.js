<body>
    <div class="container-fluid">
        <!-- Main UI -->
        <div id="selected_marks">
            <h4>
                Marks for <span class="sheet_name" id="selected_marks_title">Sheet Name</span>
                <button title="Choose Sheet" type="button" class="btn btn-link" id="show_choose_sheet_button">
                  <i class="material-icons">build</i>
                </button>
                <button title="Reset Filters" type="button" class="btn btn-link" id="reset_filters_button">
                    <i class="material-icons">replay</i>
                </button>
            </h4>
            <div id="data_table_wrapper"></div>
            <div id="no_data_message">
                <h5>No marks selected</h5>
            </div>
        </div>
    </div>

    <!-- Choose Sheet Dialog (See https://www.w3schools.com/bootstrap/bootstrap_modal.asp for bootstrap dialog info) -->
    <div id="choose_sheet_dialog" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Choose a Sheet from <span class="sheet_name" id="choose_sheet_title"></span></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
                </div>
                <div class="modal-body">
                    <div id="choose_sheet_buttons"></div>
                </div>
            </div>
        </div>
    </div>
</body>


function showChooseSheetDialog() {
  const dashboardName = tableau.extensions.dashboardContent.dashboard.name;
  const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

  const worksheetNames = worksheets.map((worksheet) => {
    return worksheet.name;
  });

  demoHelpers.showDialog(dashboardName, worksheetNames);
}



