$(document).ready(() => {
    const $fromPeriod = $('#js-detailing-apartments-from-period');
    const $endPeriod = $('#js-detailing-apartments-end-period');
    const $customer = $('.js-detailing-apartments-customer');
    const $accept = $('.js-detailing-apartments-accept');
    const $save = $('.js-detailing-apartments-save');
    const $print = $('.js-detailing-apartments-print');
    const $cancel = $('.js-detailing-apartments-cancel');

    var $table = $('.js-detailing-apartments-reservs-list');

    let reservsData = [];

    $save.on('click', async function () {

        const reservs = reservsData
            .map(item => item.id)
            .join(',');

        const customer = $customer.val() || null;

        const period_from = $fromPeriod.val();
        const period_end = $endPeriod.val();

        const { body } = await request('/api/detailing-apartments/save', { reservsIds: reservs, customer, period_from, period_end });

        $('#js-detailing-apartments-list').dataTable()
            .fnAddData([body.created_at, `${period_from} - ${period_end}`, body.id, body.customer_name, body.sum, `<a href="/detailing-apartments/${body.id}" target="_blank">Подробнее</a>`]);
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

        window.open(`/api/detailing-apartments/downloadDetail?fromPeriod=${fromPeriod}&endPeriod=${endPeriod}&customer_id=${customer_id}&ids=${ids}`);
    })

    $accept.on('click', async function (e) {
        const fromPeriod = $fromPeriod.val();
        const endPeriod = $endPeriod.val();
        const customer = $customer.val() || null;

        const passenger_id = $('#js-detailing-apartments-passenger').val();
        const apartment_id = $('#js-detailing-apartments-apartment').val();
        const manager_id = $('#js-detailing-apartments-manager').val();

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

        const { data } = await request('/api/apartmentReservations/get', {
            fromPeriod,
            endPeriod,
            customer,
            passenger_id,
            apartment_id,
            manager_id,
        });

        reservsData = data;

        $table.DataTable()
            .clear()
            .draw();

        let sum = 0;

        data.forEach((item) => {

            sum += +item.sum;

            $table.DataTable().row.add([
                `<td class="text-center">
                    <i data-id="${item.id}" data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>
                </td>`,
                new Date(item.entry).toLocaleDateString() + ' - ' + new Date(item.departure).toLocaleDateString(),
                item.customer_name,
                item.address,
                item.client_name,
                item.sum
            ]).draw();
        });

        $('#js-detailing-apartments-total-sum').text(sum);
    })

    datatableInit();

    function datatableInit() {

        // format function for row details
        const fnFormatDetails = function (datatable, tr, id = '') {
            const data = reservsData.find(item => item.id == id);

            const { number_of_clients } = data;

            return `
                <table class="table mb-none">
                    <tr>
                        <td><label class="mb-none">Время заезда:</label></td>
                        <td>21.05.2019 в 15:30</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Время выезда:</label></td>
                        <td>23.05.2019 в 15:30</td>
                    </tr>
                    <tr>
                        <td>
                            <label class="mb-none">Количество гостей:</label>
                        </td>
                        <td>${number_of_clients} человек</td>
                    </tr>
                    <tr>
                        <td>
                            <label class="mb-none">Подробнее:</label>
                        </td>
                        <td>
                            <a href="/apartment-reservations/${id}">Посмотреть заявку</a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label class="mb-none">Действие:</label>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="js-detailing-apartments-removeRow" data-id="${id}">Удалить строку из подборки</a>
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

        $table.on('click', '.js-detailing-apartments-removeRow', function (e) {

            const id = $(this).data('id');
            const tr = openedRows.get(+id);

            datatable.fnClose(tr);
            $table.DataTable().row(tr).remove().draw();

            openedRows.delete(+id);

            const findedData = reservsData.find(item => item.id == id);

            const $totalSum = $('#js-detailing-apartments-total-sum');
            const totalSum = $totalSum.text();

            $totalSum.text(+totalSum - +findedData.sum);

            reservsData = reservsData.filter(item => findedData !== item);
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