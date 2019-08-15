$(document).ready(function () {
    const $periodLeft = $('.js-actSverki-periodLeft');
    const $periodRight = $('.js-actSverki-periodRight');
    const $customer = $('.js-actSverki-customer');
    const $accept = $('.js-actSverki-accept');
    const $save = $('.js-actSverki-save');
    const $print = $('.js-actSverki-print');
    const $cancel = $('.js-actSverki-cancel');
    const $table = $('.js-actSverki-table');
    const $documents = $('#js-act-sverki-documents-table');

    $accept.on('click', onAccept);
    $cancel.on('click', onCancel);
    $print.on('click', onPrint);

    let state = {
        money: [],
        positions: [],
        saldo: '',
        totalSum: ''
    };

    $save.on('click', onSave);

    $documents.dataTable({
        initComplete(settings, json) {
            $('.zag').remove();
            $(this).show(300);
        }
    });

    async function onSave() {
        const { money, deals, saldo, totalSumWithSaldo: totalSum } = state;
        const period_left = $periodLeft.val();
        const period_right = $periodRight.val();
        const supplier_id = $customer.val();

        if (!money.length || !money.length)
            return false;

        const { data: body } = await request('/api/act-sverki-suppliers/document/save', {
            money,
            deals,
            saldo,
            totalSum,
            period_left,
            period_right,
            supplier_id,
        });

        var t = $documents.DataTable();

        t.row.add([
            body.created,
            body.id,
            body.customer_name,
            `<a href="/act-sverki-suppliers/${body.id}" target="_blank">Подробнее</a>`
        ]).draw(false);
    }

    async function onAccept() {

        const period_left = $periodLeft.val();
        const period_right = $periodRight.val();
        const supplier_id = $customer.val();

        if (!period_left || !period_right || !supplier_id) {
            return alert('Выбраны не все поля');
        }

        const { body: html, data } = await request('/api/act-sverki-suppliers/getTable', { period_left, period_right, supplier_id });
        $table.find('tbody tr').remove();
        $table.find('tbody').html(html);

        state = data;
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