function initSelect2(select, index = 0) {
    const data = {
        allowClear: true,
        placeholder: 'Выберите значение',
        width: '100%',
    };
    const $element = $(select);
    const modal = $element.data('modal');
    const ajaxUrl = $element.data('ajax');
    const selected = $element.data('selected');

    if (modal) {
        data.dropdownParent = $(modal);
    }

    if (!$element.attr('id')) {
        $element.attr('id', 'js-select' + index);
    }

    if (ajaxUrl) {
        data.ajax = {
            url: ajaxUrl,
            type: "GET",
            delay: 250,
            dataType: 'json',
            data: function (params) {
                return {
                    search: params.term,
                };
            },
            processResults: function (data) {

                const results = [];

                $element.find('option[value=""]').each((index, item) => {
                    results.push({
                        text: $(item).text(),
                        id: $(item).attr('value'),
                        selected: $(item).prop('selected')
                    });
                });

                $.each(data.items, function (index, item) {
                    results.push({
                        text: item.name,
                        id: item.id,
                        selected: selected
                            ? selected == item.id
                            : false
                    })
                });

                return {
                    results: [...results]
                }
            }
        };
    }

    $element.select2(data).on('select2:unselecting', function() {
        $(this).data('unselecting', true);
    }).on('select2:opening', function(e) {
        if ($(this).data('unselecting')) {
            $(this).removeData('unselecting');
            e.preventDefault();
        }
    });
}

$(function () {

    $('select.js-select2-init').each(function (index, element) {
        initSelect2(element, index);
    })

    const $apartmentReservations = $('#js-apartmentReservations-form');
    const $carReservations = $('#js-carReservations-form');

    $apartmentReservations.on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });
        $apartmentReservations.find('.modal-dismiss').click();

        if ($('#js-apartment-reservations-table').length) {
            insertTable('apartment-reservations', data.id, [data.manager_name, data.id, data.created_at, data.address, data.client_name, data.customer_name, data.statusName]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
        }

        return false;
    })

    $('#js-select2-clients-id').on('select2:select', function (e) {
        const val = $(this).val();

        request('/api/clients/getOne', { id: val })
            .then(result => {
                $apartmentReservations.find('[name=contact_number]').val(result.client.contact_number);
                $carReservations.find('[name=contact_number]').val(result.client.contact_number);
            })
    })

    $('#js-pricesList-carNames-select').select2({
        dropdownParent: $('#add-products'),
        placeholder: 'Выберите марку автомобиля',
        ajax: {
            url: '/api/cars/getNames',
            type: "POST",
            dataType: 'json',
            delay: 250,
            data(params) {
                var query = {
                    search: params.term,
                }

                return query;
            },
            processResults: function (data) {
                return {
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.name,
                            id: item.name
                        }
                    })
                }
            }
        }
    });

    $('#js-pricesList-carNames-select').on('select2:select', function (e) {

        const name = $(this).select2('val');

        request('/api/cars/getModels', { name }).then(result => {
            const { data: models } = result;

            $('#js-pricesList-carModels-select')
                .find('option:not(:first)')
                .remove();

            $('#js-pricesList-carModels-select')
                .val('0')
                .change();

            models.forEach(({ model }) => {
                const option = new Option(model, model);
                $('#js-pricesList-carModels-select').append(option);
            })
        })
    })

    $('#js-pricesList-carModels-select').select2({
        dropdownParent: $('#add-products'),
        placeholder: 'Выберите модель автомобиля'
    });

    $('.js-select2-select').select2({
        dropdownParent: $('#add-products').length ? $('#add-products') : null,
    });

    $('#js-incomesForm-documents, #js-costsForm-documents').select2({
        dropdownParent: $('#add-products').length ? $('#add-products') : null,
    });

    $('#js-incomesForm-documents-view, #js-costsForm-documents-view').select2({
        dropdownParent: null,
    });

    $('#js-costsForm-cashStorages-view').select2({
        dropdownParent: null,
    });

    $('#js-costsForm-category-view').select2({
        dropdownParent: null,
    });

    $('#js-select2-apartments-id').on('select2:select', async function (e) {
        const val = $(this).val();

        const result = await request('/api/apartments/getOne', { id: val })

        $apartmentReservations.find('[name=price_per_day]').val(result.apartment.price_per_day);

    })

    $('#js-select2-customer-id').on('select2:select', async function (e) {
        const val = $(this).val();

        const { data } = await request('/api/customers/getOne', { id: val })

        $apartmentReservations.find('[name=discount]')
            .val(data.discount)
            .trigger('input');

        $carReservations.find('[name=discount]')
            .val(data.discount)
            .trigger('input');
    });

    $('#js-select2-cashStorages-id').select2({
        allowClear: true,
        dropdownParent: $('#add-products'),
        ajax: {
            url: '/api/cashStorages/get',
            dataType: 'json',
            type: "POST",
            quietMillis: 50,
            processResults: function (data) {
                return {
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                }
            }
        }
    });

    $('#js-select2-services-id').select2({
        dropdownParent: $('#add-products'),
        ajax: {
            url: '/api/additionalServices/get',
            dataType: 'json',
            type: "POST",
            quietMillis: 50,
            processResults: function (data) {
                return {
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                }
            }
        }
    });
});