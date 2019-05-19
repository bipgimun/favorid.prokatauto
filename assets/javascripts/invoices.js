$(document).ready(function () {
    $('#js-invoices-base-select').select2({
        dropdownParent: $('#create-paying-document').length ? $('#create-paying-document') : null,
        placeholder: "Выберите основание",
        allowClear: true
    });
})