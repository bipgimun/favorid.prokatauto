$(function () {
    const $timeMin = $('#js-flowFounds-timeMin');
    const $timeMax = $('#js-flowFounds-timeMax');
    const $cashStorageId = $('#js-flowFounds-cashStorage-id');
    const $accept = $('#js-flowFounds-accept');
    const $print = $('#js-flowFounds-print');
    const $cancel = $('#js-flowFounds-cancel');
    const $table = $('#js-flow-founds-table');


    $accept.on('click', async function () {
        const timeMin = $timeMin.val();
        const timeMax = $timeMax.val();
        const cashStorageId = $cashStorageId.val();

        if (!timeMin || !timeMax) {
            alert('Не выбран период');
            return false;
        }

        const { body } = await request('/api/flow-founds/getTable', { timeMax, timeMin, cashStorageId });
        $table.html(body);
    });

    $print.on('click', function () {

        const timeMin = $timeMin.val();
        const timeMax = $timeMax.val();
        const cashStorageId = $cashStorageId.val();

        if (!timeMin || !timeMax) {
            alert('Не выбран период');
            return false;
        }

        location.href = '/api/flow-founds/print?' + $.param({ timeMax, timeMin, cashStorageId });
        // console.log('/api/flow-founds/print?' + $.param({ timeMax, timeMin, cashStorageId }));
    })
})