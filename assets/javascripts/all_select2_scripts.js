$(document).ready(() => {

    $('select.js-select2-init').select2({
        allowClear: true,
    });

  const $apartmentReservations = $('#js-apartmentReservations-form');

    $apartmentReservations.on('submit', async function (e) {
      e.preventDefault();

      const $form = $(this);
      const url = $form.attr('action');

      const values = getFormValues($form);

      const services = $('#js-select2-services-id').select2('data') || [];

      const servicesIds = services
          .map(item => item.id)
          .join(',');

      values.services = servicesIds;

      const { data } = await request(url, { values }, { showNotify: true });
      $apartmentReservations.find('.modal-dismiss').click();

      if ($('#js-apartment-reservations-table').length) {
          insertTable('apartment-reservations', data.id, [data.id, data.created_at, data.address, data.client_name, data.statusName]);
      } else {
          Object.keys(data).forEach(key => {
              $form.find(`[data-target=${key}]`).text(data[key]);
          })
          $('.js-toggleEditable').click();
      }

      return false;
    })

    $('#js-select2-clients-id').on('select2:select', function (e) {
      const val = $(this).val();

      request('/api/clients/getOne', { id: val })
        .then(result => {
            $apartmentReservations.find('[name=contact_number]').val(result.client.contact_number);
            $('#js-carReservations-form').find('[name=contact_number]').val(result.client.contact_number);
        })
    })

    $('#js-select2-clients-id').select2({
      ajax: {
        url: '/api/clients/get',
        type: "POST",
        dataType: 'json',
        processResults: function (data) {
          return {
            results: $.map(data.clients, function (item) {
              return {
                text: item.name,
                id: item.id
              }
            })
          }
        }
      }
    });

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

    $('#js-carsListModal-select').select2({
        dropdownParent: $('#add-products'),
        placeholder: 'Выберите модель автомобиля'
    });

    $('#js-incomesForm-documents, #js-costsForm-documents').select2({
        dropdownParent: $('#add-products'),
    });

    $('#js-incomesForm-documents-view, #js-costsForm-documents-view').select2({
        dropdownParent: null,
    });

    $('#js-incomesForm-cashStorages, #js-costsForm-cashStorages').select2({
        dropdownParent: $('#add-products'),
    });

    $('#js-incomesForm-cashStorages-view, #js-costsForm-cashStorages-view').select2({
        dropdownParent: null,
    });

    $('#js-costsForm-category').select2({
        dropdownParent: $('#add-products'),
    });
    $('#js-costsForm-category-view').select2({
        dropdownParent: null,
    });

    let carsState = [];

    $('#js-carsPrice-id')
        .select2({
            dropdownParent: $('#add-products'),
            placeholder: 'Выберите Позицию из прайса'
        }).on('select2:select', async function (e) {
            const $this = $(this);
            const val = $this.val();
            const $option = $this.find(`option[value=${val}]`);
            const { model, name } = $option.data();
            const { data: cars } = await request('/api/cars/get', { model, name });

            carsState = cars;

            cars.forEach((car) => {
                const option = new Option(`${car.name} ${car.model} - ${car.number}`, car.id);
                $('#js-carsListModal-select').append(option);
            })
        })

    $('#js-carsListModal-select').select2({
        dropdownParent: $('#add-products'),
        placeholder: 'Выберите автомобиль'
    }).on('select2:select', function (e) {
        var carId = $(this).val();
        var car = carsState.find(car => car.id == carId);

        $('#js-carClassNameModal-input').val(car.class_name)
    })

    $('#js-select2-apartments-id').select2({
        ajax: {
            url: '/api/apartments/get',
            type: "POST",
            dataType: 'json',
            processResults: function (data) {
                return {
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.address,
                            id: item.id
                        }
                    })
                }
            }
        }
    });

    $('#js-select2-apartments-id').on('select2:select', function (e) {
        const val = $(this).val();

        request('/api/apartments/getOne', { id: val })
            .then(result => {
                $apartmentReservations.find('[name=price_per_day]').val(result.apartment.price_per_day);
            })
    })

    $('#js-select2-customer-id').on('select2:select', function (e) {
        const val = $(this).val();

        request('/api/customers/getOne', { id: val })
            .then(result => {
                $apartmentReservations.find('[name=discount]').val(result.data.discount);
                $('#js-carReservations-form').find('[name=discount]').val(result.data.discount);
            })
    })

    const resetValue = (index, item) => {
        const $item = $(item);
        const defaultValue = $item.data('default') || '';

        if ($item.hasClass('js-select2-init')) {
            $item.val(null).trigger('change');
        } else {
            $item.val(defaultValue);
        }
    }
})

/*    Form    */
(function ($) {
    'use strict';

    $('.modal-with-form').magnificPopup({
        type: 'inline',
        preloader: false,
        focus: '#name',
        modal: true,

        // When elemened is focused, some mobile browsers in some cases zoom in
        // It looks not nice, so we disable it:
        callbacks: {
            beforeOpen: function () {
                if ($(window).width() < 700) {
                    this.st.focus = false;
                } else {
                    this.st.focus = '#name';
                }

                $('select.js-select2-init').select2({
                    allowClear: true,
                    dropdownParent: $('#add-products')
                });

                $('#js-select2-customer-id').select2({
                    allowClear: true,
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/customers/get',
                        dataType: 'json',
                        type: "POST",
                        quietMillis: 50,
                        processResults: function (data) {
                            return {
                                results: $.map(data.customers, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-clients-id').select2({
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/clients/get',
                        type: "POST",
                        dataType: 'json',
                        processResults: function (data) {
                            return {
                                results: $.map(data.clients, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-apartments-id').select2({
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/apartments/get',
                        type: "POST",
                        dataType: 'json',
                        processResults: function (data) {
                            return {
                                results: $.map(data.data, function (item) {
                                    return {
                                        text: item.address,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
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
            }
        }
    });
}).apply(this, [jQuery]);