
function resetFilters() {
    const worksheet = demoHelpers.getSelectedSheet(tableau.extensions.settings.get('sheet'));
    filteredColumns.forEach((columnName) => {
        worksheet.clearFiltersAsync(columnName);
    });

    filteredColumns = [];
}

$('#reset_filters_button').click(resetFilters);

