
$(document).ready(() => {

    $('table.display').DataTable({
        initComplete(settings, json) {
            $('.zag').remove();
            $(this).show(300);
        }
    });

    $('.js-select2-init').select2({
        allowClear: true
    });

    $('#js-sale-service-add').click(async () => {
        const $servicesContainer = $('#js-services-container');
        const $services = $servicesContainer.find('tr');

        const datas = [];

        $services.each((index, service) => {
            const $service = $(service);
            const master = $service.find(`[name=master]`).val();
            const serviceId = $service.find(`[name=service]`).val();
            const price = $service.find(`[name=price]`).val();
            const percentMaster = $service.find(`[name=percent_master]`).val();
            const percentAdmin = $service.find(`[name=percent_admin]`).val();
            const comment = $service.find(`[name=comment]`).val();

            datas.push({ master, service: serviceId, price, percent_master: percentMaster, percent_admin: percentAdmin, comment });
        });

        await request('/api/salesServices/add', { datas }, { showNotify: true });

        $services.each((index, service) => {
            $(service).find(`[name]`).each(resetValue);
        })
    });

    $('#js-sale-good-add').click(async () => {
        const $servicesContainer = $('#js-goods-container');
        const $service = $servicesContainer.find('tr');

        const good = $service.find(`[name=good]`).val();
        const count = $service.find(`[name=count]`).val();
        const price = $service.find(`[name=price]`).val();
        const percent_admin = $service.find(`[name=percent_admin]`).val();
        const comment = $service.find(`[name=comment]`).val();
        const is_purchase_price = $(`[name=js-is-purchase-price]:checked`).val();

        const postData = { good, count, price, percent_admin, comment, is_purchase_price };

        await request('/api/salesGoods/add', postData, { showNotify: true });
        $service.find(`[name]`).each(resetValue);
    });

    $('#js-costs-add').click(async () => {

        const $cost = $('#js-costs-container');

        const category_id = $cost.find(`[name=category]`).val();
        const sum = $cost.find(`[name=sum]`).val();
        const comment = $cost.find(`[name=comment]`).val();

        const postData = { category_id, sum, comment };

        await request('/api/costs/add', postData, { showNotify: true });

        $cost.find(`[name]`).each(resetValue);
    });

    $('#js-income-add').click(async () => {
        const $income = $('#js-incomes-container');

        const item = $income.find(`[name=item]`).val();
        const sum = $income.find(`[name=sum]`).val();
        const comment = $income.find(`[name=comment]`).val();

        const postData = { sum, comment, item };

        await request('/api/income/add', postData, { showNotify: true });

        $income.find(`[name]`).each(resetValue);
    });

    $('#js-coming-goods-add').click(async () => {
        const incomingContainer = $('#js-coming-goods-container');
        const $comingGoods = incomingContainer.find('tr');

        const datas = [];

        $comingGoods.each((index, comingGood) => {
            const $comingGood = $(comingGood);

            const date = $comingGood.find(`[name=date]`).val();
            const good_id = $comingGood.find(`[name=good]`).val();
            const count = $comingGood.find(`[name=count]`).val();

            const postData = { date, good_id, count };

            datas.push(postData);
        })

        await request('/api/comingGoods/add', { datas }, { showNotify: true });
        $comingGoods.find(`[name]`).each(resetValue);
    });

    $('#js-coming-goods-container').on('change', '.js-comingGoods-selectGood', async function () {
        const $this = $(this);
        const $item = $this.parents('.js-comingGoods-item');
        const goodId = $this.val();

        const { body: goodInfo } = await request('/api/goods/getInfo', { id: goodId });
        const { purchase_price: price } = goodInfo;

        const count = $item.find('[name=count]').val();

        const sum = price * count;

        $item.find('[name=price]').val(price);
        $item.find('[name=sum]').val(sum);
    });

    $('#js-coming-goods-container').on('input', '.js-comingGoods-inputCount', function () {
        const $this = $(this);
        const $item = $this.parents('.js-comingGoods-item');
        const price = $item.find('[name=price]').val();
        const count = $this.val();
        const sum = price * count;

        $item.find('[name=sum]').val(sum);
    });

    // CASHBOX------------------------------------------------

    $('.js-cashbox-setPeriod').on('input', async function () {
        const leftDate = $('#js-cashbox-setLeftPeriod').val();
        const rightDate = $('#js-cashbox-setRightPeriod').val();

        if (!leftDate || !rightDate)
            return false;

        const { data } = await request('/api/cashbox/loadData', { leftDate, rightDate });
        $('#js-cashbox-tableWrapper').html(data);
    });

    $('.js-cashbox-loadPeriod').click(async function () {
        const value = $(this).data('period');

        const { data } = await request('/api/cashbox/loadData', { period: value });
        $('.js-cashbox-setPeriod').val("");
        $('#js-cashbox-tableWrapper').html(data);
    });

    // CASHBOX------------------------------------------------

    $('.js-salesGoods-selectGood').change(async function () {
        const $this = $(this);
        const $item = $this.parents('.js-goods-item');
        const id = $this.val();

        if (!id)
            return false;

        const { body: goodInfo } = await request('/api/goods/getInfo', { id });

        const isPurchase = $('[name=js-is-purchase-price]:checked').val();
        const price = isPurchase !== '1'
            ? goodInfo.selling_price
            : 0;

        const count = $item.find('[name=count]').val();
        const sum = price * count;

        $item.find('[name=price]').val(price);
        $item.find('[name=sum]').val(sum);
    });

    $('.js-salesGoods-inputCount').on('input', function () {
        const $this = $(this);
        const $item = $this.parents('.js-goods-item');

        const price = $item.find('[name=price]').val();
        const count = $this.val();

        const sum = price * count;

        $item.find('.js-salesGoods-calcSum').val(sum);
    });

    $('.js-salesGoods-changePriceType').change(async function () {
        const $this = $(this);
        const $item = $('.js-goods-item');
        const goodId = $item.find('[name=good]').val();
        const isPurchase = $this.val() == '1';

        const percentAdminInput = $item.find('[name=percent_admin]');
        const defaultAdminPercent = percentAdminInput.data('default');

        if (isPurchase) {
            $item.find('[name=price]').val('0');
            percentAdminInput.attr('disabled', true).val('0');
        }
        else {
            $item.find('[name=price]').val('');
            percentAdminInput.removeAttr('disabled').val(defaultAdminPercent);
        }

        if (!goodId)
            return false;

        const { body: goodInfo } = await request('/api/goods/getInfo', { id: goodId });

        const price = !isPurchase
            ? goodInfo.selling_price
            : 0;

        const count = $item.find('[name=count]').val();
        const sum = price * count;

        $item.find('[name=sum]').val(sum);
        $item.find('[name=price]').val(price);
    });

    $('.js-report-selectPeriod').on('input', async () => {
        const leftDate = $('.js-report-getLeftDate').val();
        const rightDate = $('.js-report-getRightDate').val();

        if (!leftDate || !rightDate)
            return false;

        const { data } = await request('/api/report/getTable', { leftDate, rightDate });
        $('.js-report-loadedTable').html(data);
    });

    $('.js-salaryStatement-loadTable').on('input', async () => {
        const leftDate = $('#js-salaryStatement-leftDate').val();
        const rightDate = $('#js-salaryStatement-rightDate').val();
        const id = $('#js-salaryStatement-employee').val();

        if (!leftDate || !rightDate || !id)
            return false;

        const { body } = await loadSalaryTable({ id, rightDate, leftDate });
        $('#js-salaryStatement-table').html(body);
    });

    const charts = {
        chart1: null,
        chart2: null,
        chart3: null,
    };

    $('.js-analytics-loadCharts').change(async () => {
        const leftDate = $('#js-analytics-leftDate').val();
        const rightDate = $('#js-analytics-rightDate').val();

        if (!leftDate || !rightDate)
            return false;

        const { body, groupCosts, groupServices } = await request('/api/analytics/loadCharts', { leftDate, rightDate });

        const canvas1 = document.getElementById("myChart1");
        const canvas2 = document.getElementById("myChart2");
        const canvas3 = document.getElementById("myChart3");

        

        if (charts.chart1)
            charts.chart1.destroy();
        if (charts.chart2)
            charts.chart2.destroy();
        if (charts.chart3)
            charts.chart3.destroy();

        charts.chart1 = new Chart(canvas1, {
            type: 'line',
            data: {
                labels: Object.keys(body),
                datasets: [{
                    label: "Выручка",
                    data: Object.values(body).map(item => item.proceeds),
                    fill: false,
                    borderColor: "#0088cc",
                    backgroundColor: "#34495e",
                    lineTension: 0.1
                }, {
                    label: "Прибыль",
                    data: Object.values(body).map(item => item.profit),
                    fill: false,
                    borderColor: "#0088cc",
                    backgroundColor: "#34495e",
                    lineTension: 0.1
                },
                {
                    label: "Расходы",
                    data: Object.values(body).map(item => item.totalCosts),
                    fill: false,
                    borderColor: "#34495e",
                    backgroundColor: "#0088cc",
                    lineTension: 0.1
                }]
            },
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                aspectRatio: 2,
                onResize: null
            }
        });

        charts.chart2 = new Chart(canvas2, {
            type: 'bar',
            data: {
                labels: Object.keys(groupCosts).map((item, index) => index + 1),
                datasets: [{
                    label: 'Расходы по группе',
                    data: Object.values(groupCosts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]

                },
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                aspectRatio: 2,
                onResize: null,
            }
        });

        charts.chart3 = new Chart(canvas3, {
            type: 'pie',
            data: {
                labels: Object.keys(groupServices),
                datasets: [{
                    data: Object.values(groupServices),
                    fill: false,
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    lineTension: 0.1
                }]
            },
            options: {
                responsive: true,
                responsiveAnimationDuration: 0,
                maintainAspectRatio: false,
                aspectRatio: 2,
                onResize: null,
                title: {
                    display: true,
                    text: "Продажи по категориям (услуги)"
                }
            }
        });
    });


    $('.js-salesReport-goods-loadTable').on('input', async () => {
        const leftDate = $('#js-salesReport-goods-leftDate').val();
        const rightDate = $('#js-salesReport-goods-rightDate').val();

        if (!leftDate || !rightDate)
            return false;

        const { body } = await request('/api/salesReport/loadGoodsTable', { leftDate, rightDate });
        $('#js-salesReport-goods-body').html(body);
    });

    $('.js-salesReport-services-loadTable').on('input', async () => {
        const leftDate = $('#js-salesReport-services-leftDate').val();
        const rightDate = $('#js-salesReport-services-rightDate').val();

        if (!leftDate || !rightDate)
            return false;

        const { body } = await request('/api/salesReport/loadServicesTable', { leftDate, rightDate });
        $('#js-salesReport-services-body').html(body);
    });

    $('.js-remnantsOfGoods-oborot-loadTable').on('input', async () => {
        const leftDate = $('#js-remnantsOfGoods-oborot-leftDate').val();
        const rightDate = $('#js-remnantsOfGoods-oborot-rightDate').val();

        if (!leftDate || !rightDate)
            return false;

        const { body } = await request('/api/remnants-of-goods/loadTableOborotGoods', { leftDate, rightDate });
        $('#js-remnantsOfGoods-oborot-table').html(body);
    });

    $('#js-nomenclature-products-form').submit(async (e) => {
        e.preventDefault();
        const title = $('.js-nomenclature-products-name').val();
        const priceBuy = $('.js-nomenclature-products-priceBuy').val();
        const priceSale = $('.js-nomenclature-products-priceSale').val();

        if (!title || !priceBuy || !priceSale)
            return false;

        await request('/api/nomenclature/addProduct', { title, purchase_price: priceBuy, selling_price: priceSale }, { showNotify: true });

        $('#js-nomenclature-products-table').dataTable().fnAddData([title, priceBuy, priceSale]);
        $('.js-nomenclature-products-cancel').click();

        $('.js-nomenclature-products-name').val('');
        $('.js-nomenclature-products-priceBuy').val('');
        $('.js-nomenclature-products-priceSale').val('');
        return false;
    });

    $('#js-nomenclature-services-form').submit(async (e) => {
        e.preventDefault();
        const title = $('.js-nomenclature-services-name').val();

        if (!title)
            return false;

        await request('/api/nomenclature/addService', { title }, { showNotify: true });

        $('#js-nomenclature-services-table').dataTable().fnAddData([title]);
        $('.js-nomenclature-services-cancel').click();
        $('.js-nomenclature-services-name').val('');
        return false;
    });

    const loadSalaryTable = (data) => {
        return request('/api/salaryStatement/getTable', data);
    };

    const request = (url, data, options = { showNotify: false }) => {
        return new Promise((resolve, reject) => {
            $.post(url, data).done(result => {
                if (result.status !== 'ok') {

                    console.error(result);

                    var notice = new PNotify({
                        title: 'Ошибка',
                        text: result.message,
                        icon: 'fa fa-user',
                        shadow: true,
                        delay: 1000,
                        buttons: {
                            closer: false,
                            sticker: false
                        }
                    });

                    notice.get().click(function () {
                        notice.remove();
                    });

                    return reject(result);
                }

                if (options.showNotify === true) {
                    var notice = new PNotify({
                        title: 'Успешно',
                        text: 'Успешно выполнено',
                        type: 'success',
                        shadow: true,
                        delay: 1000,
                        buttons: {
                            closer: false,
                            sticker: false
                        }
                    });

                    notice.get().click(function () {
                        notice.remove();
                    });
                }

                resolve(result);
            })
        })
    };

    const resetValue = (index, item) => {
        const $item = $(item);
        const defaultValue = $item.data('default') || '';

        if ($item.hasClass('js-select2-init')) {
            $item.val(null).trigger('change');
        } else {
            $item.val(defaultValue);
        }
    }

    // Клиентская валидация на странице "Учет услуг" полей процент мастера и админа

    var $tableContainer = $('.services-inp');
    var $masterInput = $tableContainer.find('input[name="percent_master"]');
    var $adminInput = $tableContainer.find('input[name="percent_admin"]');

    $masterInput.on('input', function () {
        var masterN = Number($masterInput.val());
        var adminN = Number($adminInput.val());
        var summ = masterN + adminN;

        if ((100 - adminN) < masterN) {
            $masterInput.val(100 - adminN);
        };

        if (masterN < 0) {
            $masterInput.val('0');
        };

    });

    $adminInput.on('input', function () {
        var masterN = Number($masterInput.val());
        var adminN = Number($adminInput.val());

        if ((100 - masterN) < adminN) {
            $adminInput.val(100 - masterN);
        };

        if (adminN < 0) {
            $adminInput.val('0');
        };
    });
<<<<<<< HEAD
=======



>>>>>>> 4df0303798aa54b34baf5ab76a2fcdea3cdc98b5
});