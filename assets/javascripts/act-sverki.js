$(document).ready(function () {
    const $periodLeft = $('.js-actSverki-periodLeft');
    const $periodRight = $('.js-actSverki-periodRight');
    const $customer = $('.js-actSverki-customer');
    const $accept = $('.js-actSverki-accept');
    const $save = $('.js-actSverki-save');
    const $print = $('.js-actSverki-print');
    const $cancel = $('.js-actSverki-cancel');
    const $table = $('.js-actSverki-table');

    $accept.on('click', onAccept);
    $cancel.on('click', onCancel);
    $print.on('click', onPrint);

    async function onAccept() {

        const period_left = $periodLeft.val();
        const period_right = $periodRight.val();
        const customer_id = $customer.val();

        if (!period_left || !period_right || !customer_id) {
            return alert('Выбраны не все поля');
        }

        const { body: html } = await request('/api/act-sverki/getTable', { period_left, period_right, customer_id });
        $table.find('tbody tr').remove();
        $table.find('tbody').html(html);
    }

    function onPrint() {
        const period_left = $periodLeft.val();
        const period_right = $periodRight.val();
        const customer_id = $customer.val();

        if (!period_left || !period_right || !customer_id) {
            return alert('Выбраны не все поля');
        }

        const query = $.param({
            period_left,
            period_right,
            customer_id
        })

        window.open('/api/act-sverki/print?' + query);
    }

    async function onCancel() {
        $periodLeft.val('');
        $periodRight.val('');
        $customer.val('');
        $table.find('tbody tr').remove();
    }
})