$(document).ready(() => {
    const $fromPeriod = $('#js-detailing-car-from-period');
    const $endPeriod = $('#js-detailing-car-end-period');
    const $withDriver = $('.js-detailing-cars-with-driver');
    const $withoutDriver = $('.js-detailing-cars-without-driver');
    const $customer = $('.js-detailing-cars-customer');
    const $accept = $('.js-detailing-cars-accept');

    $accept.on('click', async function (e) {
        const fromPeriod = $fromPeriod.val();
        const endPeriod = $endPeriod.val();
        const withDriver = $withDriver.is(':checked') ? '1' : '0';
        const withoutDriver = $withoutDriver.is(':checked') ? '1' : '0';
        const customer = $customer.val();

        // console.log('fromPeriod', fromPeriod);
        // console.log('endPeriod', endPeriod);
        // console.log('withDriver', withDriver);
        // console.log('withoutDriver', withoutDriver);
        // console.log('customer', customer);
        // console.log('-------------------------------');

        if (!fromPeriod && !endPeriod) {
            return new PNotify({
                title: 'Ошибка',
                text: 'Не выбран период',
                icon: 'fa fa-user',
                shadow: true,
                delay: 1000,
                buttons: {
                    closer: false,
                    sticker: false
                }
            });
        }

        if (!customer) {
            return new PNotify({
                title: 'Ошибка',
                text: 'Не выбран заказчик',
                icon: 'fa fa-user',
                shadow: true,
                delay: 1000,
                buttons: {
                    closer: false,
                    sticker: false
                }
            });
        }

        await request('/api/carReservations/get', { fromPeriod, endPeriod, customer, withDriver, withoutDriver });

    })
})