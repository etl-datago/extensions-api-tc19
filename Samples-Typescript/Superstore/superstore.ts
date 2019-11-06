import { Worksheet } from '@tableau/extensions-api-types';

class Superstore {

    private filteredColumns = [];

    private static getSelectedSheet(worksheetName): Worksheet {
        // Go through all the worksheets in the dashboard and find the one we want
        return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet: Worksheet) {
            return sheet.name === worksheetName;
        });
    }

    private static geCurrentlySelectedSheet(): Worksheet {
        const worksheetName = tableau.extensions.settings.get('sheet');
        return Superstore.getSelectedSheet(worksheetName);
    }

    private static populateDataTable(worksheetName, rows, columnHeaders, onColumnHeaderClicked) {

        // Set our title to an appropriate value
        $('#selected_marks_title').text(worksheetName);

        // Do some UI setup here change the visible section and reinitialize the table
        $('#data_table_wrapper').empty();

        if (rows.length > 0) {
            $('#no_data_message').css('display', 'none');

            $('#data_table_wrapper')
            .append(`<table id='data_table' class='table table-striped table-bordered'></table>`);

            // Do some math to compute the height we want the data table to be
            const top = $('#data_table_wrapper')[0].getBoundingClientRect().top;
            const height = $(document).height() - top - 130 + 'px';

            const headerCallback = function (thead, data) {
                if (!onColumnHeaderClicked) {
                    // If we don't have a callback defined, just return early
                    return;
                }

                const headers = $(thead).find('th');
                for (let i = 0; i < headers.length; i++) {
                    const header = $(headers[i]);
                    if (header.children().length === 0) {
                        const fieldName = header.text();
                        const button = $(`<a href='#'>${fieldName}</a>`);
                        button.click(function () {

                            // Grab our column of data from the data table and filter out to just unique values
                            const dataTable = $('#data_table').DataTable({ retrieve: true });
                            const column = dataTable.column(i);
                            const columnData = column.data().toArray();

                            onColumnHeaderClicked(fieldName, columnData);

                            return false;
                        });

                        header.html(button.html());
                    }
                }
            }

            // Initialize our data table with what we just gathered
            $('#data_table').DataTable({
                data: rows,
                columns: columnHeaders.map(function (header) { return { title: header }; }),
                autoWidth: false,
                deferRender: true,
                scroller: true,
                scrollY: height,
                scrollX: true,
                ordering: !onColumnHeaderClicked,
                headerCallback: headerCallback,
                dom: "<'row'<'col-sm-6'i><'col-sm-6'f>><'row'<'col-sm-12'tr>>", // Do some custom styling
            });
        } else {
            // If we didn't get any rows back, there must be no marks selected
            $('#no_data_message').css('display', 'inline');
        }
    }

    // Avoid globals.
    constructor(private _$: JQueryStatic) { }

    /**
     * Initializes the extension
     */
    public async initialize() {
        console.log('Waiting for DOM ready');
        await this._$.ready;
        console.log('Initializing extension API');
        await tableau.extensions.initializeAsync({configure: () => this.showChooseSheetDialog()});

        // Once the extensions is initialized, ask the user to choose a sheet
        const savedSheetName = tableau.extensions.settings.get('sheet');
        if (savedSheetName) {
            // We have a saved sheet name, show its selected marks
            this.onSheetSelected(savedSheetName);
        } else {
            // if there isn't a sheet saved in settings, show the dialog
            this.showChooseSheetDialog();
        }

        this.initializeButtons();
    }
    private initializeButtons() {
        $('#show_choose_sheet_button').click(() => this.showChooseSheetDialog());
        $('#reset_filters_button').click(() => this.resetFilters());
    }

    private showSelectSheetDialog(dashboardName, sheetNames) {
        // Clear out the existing list of sheets
        this._$('#choose_sheet_buttons').empty();

        // Set the dashboard's name in the title
        this._$('#choose_sheet_title').text(dashboardName);
        sheetNames.forEach(function (sheetName) {
            // Declare our new button which contains the sheet name
            const button = $("<button type='button' class='btn btn-default btn-block'></button");
            button.text(sheetName);
            button.click(() => {
                // Close the dialog and trigger the clickHandler
                this._$('#choose_sheet_dialog').modal('toggle');
                this.onSheetSelected(sheetName);
            });

            // Add our button to the list of worksheets to choose from
            this._$('#choose_sheet_buttons').append(button);
        }, this);

        // Show the dialog
        this._$('#choose_sheet_dialog').modal('toggle');
    }

    private async showChooseSheetDialog() {
        // Get the dashboard's name
        const dashboardName = tableau.extensions.dashboardContent.dashboard.name;

        // The first step in choosing a sheet will be asking Tableau what sheets are available
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

        // Next, we loop through and convert all the worksheet objects into just an array of their names
        const worksheetNames = worksheets.map(function (worksheet) {
            return worksheet.name;
        });

        // Call our helper function to show the choose sheet dialog
        this.showSelectSheetDialog(dashboardName, worksheetNames);
    }

    private async onSheetSelected(worksheetName: string) {
        // Save the selected sheet to settings then show the selected marks in the table
        tableau.extensions.settings.set('sheet', worksheetName);
        await tableau.extensions.settings.saveAsync();
        // Get the selected worksheet object and load the selected marks
        const worksheet = Superstore.getSelectedSheet(worksheetName);

        // Add an event listener for the selection changing
        worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
            // When the selection changes, reload the data
            this.loadSelectedMarks(worksheet);
        }.bind(this));

        this.loadSelectedMarks(worksheet);
    }

    private async loadSelectedMarks(worksheet: Worksheet) {

        // Call to get the selected marks for our sheet
        const marks = await worksheet.getSelectedMarksAsync();

        // Get the first DataTable for our selected marks (usually there is just one)
        const worksheetData = marks.data[0];

        // Map our data into the format which the data table component expects it
        const rows = worksheetData.data.map(function (row, index) {
            const rowData = row.map(function (cell) {
                return cell.formattedValue;
            });

            return rowData;
        });

        // Get the column headers from the field names
        const columnHeaders = worksheetData.columns.map(function (column) {
            return column.fieldName;
        });

        // Populate the data table with the rows and columns we just pulled out
        Superstore.populateDataTable(worksheet.name, rows, columnHeaders,
            (fieldName, columnData) => this.onColumnHeaderClicked(fieldName, columnData));
    }

    private onColumnHeaderClicked(fieldName, columnData) {

        // Filter down the domain of the column just to unique values
        const columnDomain = columnData.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        // Get the worksheet object and apply the filter
        const worksheet = Superstore.geCurrentlySelectedSheet();
        worksheet.applyFilterAsync(fieldName, columnDomain, tableau.FilterUpdateType.Replace, null);

        // Save the fact that we've filtered on this column to our array
        this.filteredColumns.push(fieldName);
    }

    private resetFilters() {

        // Get the worksheet and clear all the filters we have configured
        const worksheet = Superstore.geCurrentlySelectedSheet();
        this.filteredColumns.forEach(function (columnName) {
            worksheet.clearFilterAsync(columnName);
        });

        this.filteredColumns = [];
    }
}

// Wrap everything in an anonymous function to avoid polluting the global namespace
(async () => {
    console.log('Initializing Superstore extension.');
    await new Superstore($).initialize();
})();
