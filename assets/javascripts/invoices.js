$(document).ready(function () {

    const $form = $('#js-invoices-add-form');

    $('#js-invoices-base-select').select2({
        dropdownParent: $('#create-paying-document').length ? $('#create-paying-document') : null,
        placeholder: "Выберите основание",
        allowClear: true
    }).on('select2:select', function (e) {

    });

    $form.on('submit', async function (e) {
        e.preventDefault();

        const url = $form.attr('action');

        const values = getFormValues($form);
        const { data } = await request(url, values, { showNotify: true });

        window.open('/api/invoices/print-invoice?file=' + data.file);

        location.reload();

        return false;
    })
})