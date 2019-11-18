$(document).ready(() => {

    const $customer = $('#js-incomesForm-documents');

    $('#js-incomes-customer-id').on('change', async function () {



        const customerId = $(this).val();

        if(!customerId) {
            return false;
        }

        const { body: documents } = await request('/api/incomes/getDocuments', { customerId });

        $customer.find('option:not([value=0]), optgroup').remove();

        $customer
            .val('0')
            .trigger('change')
            .select2({
                dropdownParent: $('#add-products').length ? $('#add-products') : null,
                data: documents
            });
    })
})