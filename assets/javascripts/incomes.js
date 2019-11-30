$(document).ready(() => {

    const $selectDocuments = $('#js-incomesForm-documents');

    $('#js-incomes-customer-id, select[name=supplier_id], select[name=driver_id]').on('select2:clear', function(event) {
        $selectDocuments.find('option:not([value=0]), optgroup').remove();
    })

    $('#js-incomes-customer-id').on('change', async function () {

        const customerId = $(this).val();

        if (!customerId) {
            return false;
        }

        const { body: documents } = await request('/api/incomes/getDocuments', { customerId });

        $selectDocuments.find('option:not([value=0]), optgroup').remove();

        $selectDocuments
            .val('0')
            .trigger('change')
            .select2({
                dropdownParent: $('#add-products').length ? $('#add-products') : null,
                data: documents
            });
    });

    $('select[name=supplier_id]').on('select2:select', async function (event) {
        const supplierId = $(this).val();

        if (!supplierId) {
            return false;
        }

        const { body: documents } = await request('/api/incomes/getDocumentsBySupplier', { supplierId: supplierId });

        $selectDocuments.find('option:not([value=0]), optgroup').remove();

        $selectDocuments
            .val('0')
            .trigger('change')
            .select2({
                dropdownParent: $('#add-products').length ? $('#add-products') : null,
                data: documents
            });
    });
    
    $('select[name=driver_id]').on('select2:select', async function (event) {
        const driverId = $(this).val();

        if (!driverId) {
            return false;
        }

        const { body: documents } = await request('/api/incomes/getDocumentsByDriver', { driverId: driverId });

        $selectDocuments.find('option:not([value=0]), optgroup').remove();

        $selectDocuments
            .val('0')
            .trigger('change')
            .select2({
                dropdownParent: $('#add-products').length ? $('#add-products') : null,
                data: documents
            });
    });
})