$(document).ready(function () {
    const $leftDate = $('#js-salaryStatement-leftDate');
    const $rightDate = $('#js-salaryStatement-rightDate');

    const $save = $('.js-salaryStatement-save');
    const $print = $('.js-salaryStatement-print');
    const $accept = $('.js-salaryStatement-accept');
    const $cancel = $('.js-salaryStatement-cancel');

    const $driver = $('#js-salaryStatement-driver');
    const $table = $('#js-salaryStatement-table');
    const $listTable = $('#js-salaryStatement-listTable');


    $table.on('click', '.js-tr', onDeleteRow);
    $print.on('click', onPrint);
    $cancel.on('click', onCancel);

    $accept.on('click', onAccept);

    $save.on('click', onSave);

    [$leftDate, $rightDate, $driver].forEach($elem => {
        $elem.on('change', onUpdateTable);
    });

    function onUpdateTable() {
        const period_left = $leftDate.val();
        const period_right = $rightDate.val();
        const driver_id = $driver.val();
        const ids = getIds().join(',');

        if (!period_left || !period_right || driver_id === undefined) {
            return;
        }

        if (!ids) {
            return;
        }

        $accept.trigger('click');
    }

    async function onSave() {

        const period_left = $leftDate.val();
        const period_right = $rightDate.val();
        const driver_id = $driver.val();
        
        const getIdsResult = getIds();

        const reservsIds = getIdsResult.filter(item => item.reservId).map(item => item.reservId).join(',');
        const shiftsIds = getIdsResult.filter(item => item.shiftId).map(item => item.shiftId).join(',');

        if (!period_left || !period_right || driver_id === undefined) {
            return alert('Выбраны не все поля');
        }

        if (!reservsIds && !shiftsIds) {
            return alert('Список не сформирован');
        }

        const { body } = await request('/api/salaryStatement/saveReport', { period_left, period_right, driver_id, reservsIds, shiftsIds });
        insertTable([body.created_at, body.id, body.driver_name, body.sum, `<a href="/salary-statement/${body.id}" target="_blank">Подробнее</a>`]);
    }

    function insertTable(data = []) {
        const table = $listTable.DataTable();
        table.row.add([...data]).draw(false);
    }

    async function onAccept(e) {
        const leftDate = $leftDate.val();
        const rightDate = $rightDate.val();
        const driver_id = $driver.val();

        if (!leftDate || !rightDate || driver_id === undefined) {
            return alert('Выбраны не все поля');
        }

        const { body } = await request('/api/salaryStatement/getTable', { leftDate, rightDate, driver_id });
        $table.html(body);
    }

    async function onCancel() {
        $leftDate.val('');
        $rightDate.val('');
        $driver.val('');
        const { body } = await request('/api/salaryStatement/getTable', {});
        $table.html(body);
    }

    function onPrint() {

        const leftDate = $leftDate.val();
        const rightDate = $rightDate.val();
        const driver_id = $driver.val();

        if (!leftDate || !rightDate || driver_id === undefined) {
            return alert('Выбраны не все поля');
        }

        const getIdsResult = getIds();

        const reservsIds = getIdsResult.filter(item => item.reservId).map(item => item.reservId).join(',');
        const shiftsIds = getIdsResult.filter(item => item.shiftId).map(item => item.shiftId).join(',');

        const query = $.param({ leftDate, rightDate, driver_id, reservsIds, shiftsIds });

        window.open('/api/salaryStatement/print?' + query);
    }

    function onDeleteRow(e) {
        const $row = $(e.currentTarget);
        const rowSum = +$row.find('[data-sum]').attr('data-sum') || 0;

        const totalSum = getTotalSum();
        const newTotalSum = +totalSum - rowSum;

        $row.remove();

        setTotalSum(newTotalSum);
    }

    function getTotalSum() {
        return $table.find('#js-salaryStatement-totalSum').attr('data-total');
    }

    function setTotalSum(sum) {
        $table.find('#js-salaryStatement-totalSum')
            .attr('data-total', sum)
            .text(sum);
    }

    function getIds() {
        return $.map($('.js-tr'), (elem) => {
            const data = $(elem).data();

            if(data.shiftId) {
                return {shiftId: data.shiftId};
            } else if (data.reservId) {
                return {reservId: data.reservId};
            }

            return false;
        });
    }
})