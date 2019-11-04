$(document).ready(() => {
    const $fromPeriod = $('#js-detailing-car-from-period');
    const $endPeriod = $('#js-detailing-car-end-period');
    const $withDriver = $('.js-detailing-cars-with-driver');
    const $withoutDriver = $('.js-detailing-cars-without-driver');
    const $customer = $('.js-detailing-cars-customer');
    const $accept = $('.js-detailing-cars-accept');
    const $cancel = $('.js-detailing-cars-cancel');
    const $save = $('.js-detailing-cars-save');
    const $print = $('.js-detailing-cars-print');

    var $table = $('.js-detailing-cars-reservs-list');

    let reservsData = [];

    $save.on('click', async function () {

        const reservs = reservsData
            .map(item => item.id)
            .join(',');

        const customer = $customer.val();

        const period_from = $fromPeriod.val();
        const period_end = $endPeriod.val();

        const { body } = await request('/api/detailing-cars/save', { reservsIds: reservs, customer, period_from, period_end });

        $('#js-detailing-cars-list').dataTable()
            .fnAddData([body.created, `${period_from} - ${period_end}`, body.id, body.customer_name, body.sum, `<a href="/detailing-cars/${body.id}" target="_blank">Подробнее</a>`]);
    })

    $cancel.on('click', function () {
        $table.DataTable().clear().draw();
        reservsData = [];
    })

    $print.on('click', async function (e) {
        const fromPeriod = $fromPeriod.val();
        const endPeriod = $endPeriod.val();
        const customer_id = $customer.val();

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

        if (!customer_id) {
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

        if (!reservsData.length) {
            return new PNotify({
                title: 'Ошибка',
                text: 'Отсутствуют заявки',
                icon: 'fa fa-user',
                shadow: true,
                delay: 1000,
                buttons: {
                    closer: false,
                    sticker: false
                }
            });
        }

        const ids = reservsData.map(item => item.id).join(',');

        window.open(`/api/detailing-cars/downloadDetail?fromPeriod=${fromPeriod}&endPeriod=${endPeriod}&customer_id=${customer_id}&ids=${ids}`);
    })

    $accept.on('click', async function (e) {
        const fromPeriod = $fromPeriod.val();
        const endPeriod = $endPeriod.val();
        const withDriver = $withDriver.is(':checked') ? '1' : '0';
        const withoutDriver = $withoutDriver.is(':checked') ? '1' : '0';
        const customer = $customer.val() || null;

        const driver = $('#js-detailing-cars-driver').val();
        const passenger = $('#js-detailing-cars-passenger').val();
        const car = $('#js-detailing-cars-car').val();
        const manager = $('#js-detailing-cars-manager').val();

        if (!fromPeriod || !endPeriod) {
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

        const { data } = await request('/api/carReservations/get', {
            fromPeriod,
            endPeriod,
            customer,
            withDriver,
            withoutDriver,
            driver,
            passenger,
            car,
            manager,
        });

        reservsData = data;

        $table.DataTable()
            .clear()
            .draw();

        let totalSum = 0;

        data.forEach((item) => {

            totalSum += +item.sum;

            $table.DataTable().row.add([
                `<td class="text-center">
                    <i data-id="${item.id}" data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>
                </td>`,
                new Date(item.rent_start).toLocaleDateString() + ' - ' + new Date(item.rent_finished).toLocaleDateString(),
                item.customer_name,
                item.driver_id,
                item.itinerarie_name,
                item.sum
            ]).draw();
        })

        $('#js-detailing-cars-total-sum').text(totalSum);
    })

    datatableInit();

    function datatableInit() {

        // format function for row details
        const fnFormatDetails = function (datatable, tr, id = '') {
            const data = reservsData.find(item => item.id == id);

            const { class_name, rent_start } = data;

            return `
                <table class="table mb-none">
                    <tr class="b-top-none">
                        <td><label class="mb-none">Класс:</label></td>
                        <td>${class_name}</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Время:</label></td>
                        <td>${new Date(rent_start).toLocaleTimeString()}</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Подробнее:</label></td>
                        <td><a href="/car-reservation/${id}">Посмотреть заявку</a></td>
                    </tr>
                    <tr>
                        <td>
                            <label class="mb-none">Действие:</label>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="js-detailing-cars-removeRow" data-id="${id}">Удалить строку из подборки</a>
                        </td>
                    </tr>
                </table>`
        };

        // insert the expand/collapse column
        var th = document.createElement('th');
        var td = document.createElement('td');

        td.innerHTML = '<i data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>';
        td.className = "text-center";

        $table.find('thead tr').each(function () {
            this.insertBefore(th, this.childNodes[0]);
        });

        $table.find('tbody tr').each(function () {
            this.insertBefore(td.cloneNode(true), this.childNodes[0]);
        });

        const openedRows = new Map();

        // initialize
        const datatable = $table.dataTable({
            aoColumnDefs: [{
                bSortable: false,
                aTargets: [0]
            }],
            ordering: false,
            searching: false
        });

        // Object.assign(window, { getOpened: () => console.log(openedRows) });
        // Object.assign(window, { getReservs: () => console.log(reservsData) });

        $table.on('click', '.js-detailing-cars-removeRow', function (e) {

            const id = $(this).data('id');
            const tr = openedRows.get(+id);

            datatable.fnClose(tr);
            $table.DataTable().row(tr).remove().draw();

            const $totalSum = $('#js-detailing-cars-total-sum');
            const totalSum = $totalSum.text();
            const findedData = reservsData.find(item => item.id == id);

            $totalSum.text(+totalSum - +findedData.sum);

            openedRows.delete(+id);
            reservsData = reservsData.filter(item => item !== findedData);
        });

        // add a listener
        $table.on('click', 'i[data-toggle]', function (e) {
            const $this = $(this);
            const tr = $(this).closest('tr').get(0);

            const id = $(e.target).data('id');

            if (datatable.fnIsOpen(tr)) {
                $this.removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                datatable.fnClose(tr);

                openedRows.delete(+id);
            } else {
                $this.removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                datatable.fnOpen(tr, fnFormatDetails(datatable, tr, id), 'details');

                openedRows.set(+id, tr);
            }
        });
    };
})