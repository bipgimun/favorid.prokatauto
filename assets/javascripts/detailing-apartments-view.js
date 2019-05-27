$(document).ready(function () {

    const $table = $('#js-detailing-apartments-view-table');

    const reservsData = JSON.parse($('#js-reservs-data').html());

    $('.js-detailing-apartments-view-print').on('click', function (e) {
        window.open(`/api/detailing-apartments/downloadDetail?id=${$(e.target).data('id')}`);
    });

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
                </table>
            `
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

        // add a listener
        $table.on('click', 'i[data-toggle]', function (e) {
            const $this = $(this);
            const tr = $(this).closest('tr').get(0);

            const id = $(e.target).parents('tr').data('id');

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