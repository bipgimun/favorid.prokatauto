$(document).ready(() => {
    const $fromPeriod = $('#js-detailing-car-from-period');
    const $endPeriod = $('#js-detailing-car-end-period');
    const $withDriver = $('.js-detailing-cars-with-driver');
    const $withoutDriver = $('.js-detailing-cars-without-driver');
    const $customer = $('.js-detailing-cars-customer');
    const $accept = $('.js-detailing-cars-accept');
    const $cancel = $('.js-detailing-cars-cancel');

    var $table = $('.js-detailing-cars-reservs-list');

    let reservsData = [];

    $cancel.on('click', function () {
        $table.DataTable().clear().draw();
        reservsData = [];
    })

    $accept.on('click', async function (e) {
        const fromPeriod = $fromPeriod.val();
        const endPeriod = $endPeriod.val();
        const withDriver = $withDriver.is(':checked') ? '1' : '0';
        const withoutDriver = $withoutDriver.is(':checked') ? '1' : '0';
        const customer = $customer.val();

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

        const { data } = await request('/api/carReservations/get', { fromPeriod, endPeriod, customer, withDriver, withoutDriver });

        reservsData = data;

        $table.DataTable()
            .clear()
            .draw();

        data.forEach((item) => {
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

    })

    datatableInit();

    function datatableInit() {


        // format function for row details
        const fnFormatDetails = function (datatable, tr, id = '') {
            const data = reservsData.find(item => item.id == id);

            const {class_name, rent_start} = data;

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
                        <td><label class="mb-none">Действие:</label></td>
                        <td><a href="#">Удалить строку из подборки</a></td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">ДЛЯ КВАРТИР</label></td>
                        <td>------------------</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Время заезда:</label></td>
                        <td>21.05.2019 в 15:30</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Время выезда:</label></td>
                        <td>23.05.2019 в 15:30</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Количество гостей:</label></td>
                        <td>10 человек</td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Подробнее:</label></td>
                        <td><a href="">Посмотреть заявку</a></td>
                    </tr>
                    <tr>
                        <td><label class="mb-none">Действие:</label></td>
                        <td><a href="#">Удалить строку из подборки</a></td>
                    </tr>
                </table>`
        };

        // insert the expand/collapse column
        var th = document.createElement('th');
        var td = document.createElement('td');

        td.innerHTML = '<i data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>';
        td.className = "text-center";

        $table
            .find('thead tr').each(function () {
                this.insertBefore(th, this.childNodes[0]);
            });

        $table
            .find('tbody tr').each(function () {
                this.insertBefore(td.cloneNode(true), this.childNodes[0]);
            });

        // initialize
        var datatable = $table.dataTable({
            aoColumnDefs: [{
                bSortable: false,
                aTargets: [0]
            }],
            aaSorting: [
                [1, 'asc']
            ]
        });

        // add a listener
        $table.on('click', 'i[data-toggle]', function (e) {
            var $this = $(this),
                tr = $(this).closest('tr').get(0);

            const id = $(e.target).data('id');

            if (datatable.fnIsOpen(tr)) {
                $this.removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                datatable.fnClose(tr);
            } else {
                $this.removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                datatable.fnOpen(tr, fnFormatDetails(datatable, tr, id), 'details');
            }
        });
    };
})