$(document).ready(function () {
    const $leftDate = $('#js-salaryStatement-leftDate');
    const $rightDate = $('#js-salaryStatement-rightDate');

    const $save = $('.js-salaryStatement-save');
    const $print = $('.js-salaryStatement-print');
    const $accept = $('.js-salaryStatement-accept');
    const $cancel = $('.js-salaryStatement-cancel');

    const $driver = $('#js-salaryStatement-driver');
    const $table = $('#js-salaryStatement-table');

    $driver.on('change', () => { });

    $save.on('click', () => { });
    $print.on('click', onPrint);
    $cancel.on('click', onCancel);
    $accept.on('click', onAccept);


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

        const query = $.param({ leftDate, rightDate, driver_id });

        window.open('/api/salaryStatement/print?' + query);
    }
})