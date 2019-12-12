$(document).ready(function () {

    const $carReservations = $('#js-carReservations-form');
    let carsState = [];

    let currentCar = {};
    let currentItinerarie = {};
    let currentCustomer = {};

    $carReservations.find('[name=car_id]').select2({
        dropdownParent: $('#add-products'),
        placeholder: 'Выберите автомобиль',
        allowClear: true,
        ajax: {
            url: '/api/cars/get',
            type: "POST",
            dataType: 'json',
            processResults(data) {

                carsState = data.data;

                return {
                    results: $.map(data.data, function (car) {
                        return {
                            text: `${car.name} - ${car.model} - ${car.number}`,
                            id: car.id
                        }
                    })
                }
            }
        }
    }).on('select2:select', function (e) {
        const carId = $(this).val();
        const car = carsState.find(car => car.id == carId);

        currentCar = car;
        $carReservations.find('[name=class_name]').val(car.class_name);
        $carReservations.find('[name=car_deposit]').val(car.deposit).trigger('change');
        calcPrepaymentSum();
    });

    $carReservations.find('select[name=driver_id]').on('select2:select', async function (e) {
        const id = $(e.target).val();
        const { data: driver } = await request(`/api/drivers/get/${id}`);

        $carReservations.find('[name=car_id]').val('').trigger('change');
        $carReservations.find('[name=class_name]').val('');

        if (driver.car_id) {
            const { data: car } = await request('/api/cars/get/' + driver.car_id);

            const option = new Option(`${car.name} ${car.model} - ${car.number}`, car.id);

            if (!$carReservations.find('[name=car_id]').find(`option[value=${car.id}]`).length) {
                $carReservations.find('[name=car_id]')
                    .append(option);
            }

            $carReservations.find('[name=car_id]')
                .val(car.id)
                .trigger('change');

            $carReservations.find('[name=class_name]').val(car.class_name);
        }
    });

    $carReservations.find('[name=itinerarie_id]').select2({
        ajax: {
            url: '/api/itineraries/select2',
            type: "GET",
            dataType: 'json',
            processResults: function (data) {
                return {
                    results: $.map(data.items, function (item) {
                        return {
                            text: item.name,
                            id: item.id,
                        }
                    })
                }
            }
        },
        dropdownParent: $('#add-products').length ? $('#add-products') : null,
        placeholder: 'Выберите маршрут'
    }).on('select2:select', async function (e) {
        const $this = $(this);
        const val = $this.val();

        const { data: itinerarie } = await request('/api/itineraries/getOne', { id: val });

        currentItinerarie = itinerarie;
        calcPrepaymentSum();
    })

    $('[name=rent_start], [name=rent_finished], [name=discount]').on('input', function () {
        calcPrepaymentSum();
    });

    $carReservations.find('[name=customer_id]').on('select2:select', async function (e) {
        const val = $(this).val();

        const { data: customer } = await request('/api/customers/getOne', { id: val });

        $carReservations.find('[name=contact_number]').val(customer.contact_number);

        if (!$carReservations.find('#checkboxdriver').is(':checked')) {
            $carReservations.find('[name=contact_number]').val(customer.contact_number);
        }

        $carReservations.find('[name=discount]')
            .val(customer.discount)
            .trigger('input');
    });

    function getRentDays() {

        if ($carReservations.find('[name=rent_start]').val() && $carReservations.find('[name=rent_finished]').val()) {
            // @ts-ignore
            const rentStart = new Date($carReservations.find('[name=rent_start]').val());
            // @ts-ignore
            const rentFinished = new Date($carReservations.find('[name=rent_finished]').val());

            const days = Math.floor((rentFinished - rentStart) / 1000 / 3600 / 24);

            return (days > 1 ? days : 1);
        }

        return 0;
    }

    function calcPrepaymentSum() {
        const days = getRentDays();
        const pricePerDay = +(currentCar.price_per_day || 0);
        const itinerariePrice = +(currentItinerarie.price || 0);

        const discount = +$carReservations.find('[name=discount]').val() || 0;
        const sum = (days * pricePerDay + itinerariePrice) - ((days * pricePerDay + itinerariePrice) * (discount / 100));

        $carReservations.find('[name=prepayment]').val(sum).trigger('change');
    }

})