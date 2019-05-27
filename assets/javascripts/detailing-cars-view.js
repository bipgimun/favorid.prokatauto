$(document).ready(function () {

    const $table = $('#js-detailing-cars-view-table');

    const reservsData = JSON.parse($('#js-reservs-data').html());

    $('.js-detailing-cars-view-print').on('click', function (e) {
        window.open(`/api/detailing-cars/downloadDetail?id=${$(e.target).data('id')}`);
    });

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