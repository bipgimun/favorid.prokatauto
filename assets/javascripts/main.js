$(document).ready(() => {

    $('table.display').DataTable({
        initComplete(settings, json) {
            $('.zag').remove();
            $(this).show(300);
        }
    });

    $('#js-carReservations-table').DataTable({
        initComplete(settings, json) {
            $('.zag').remove();
            $(this).show(300);
        },
        createdRow(row, data, dataIndex) {
            if ((data['0'] === '1' || data['0'] === 'С водителем') && data[6] === '') {
                $(row).css({ backgroundColor: 'orange' });
            }
        }
    });

    $('select.js-select2-init').select2({
        allowClear: true,
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

    // $('#js-costs-add').click(async () => {

    //     const $cost = $('#js-costs-container');

    //     const category_id = $cost.find(`[name=category]`).val();
    //     const sum = $cost.find(`[name=sum]`).val();
    //     const comment = $cost.find(`[name=comment]`).val();

    //     const postData = { category_id, sum, comment };

    //     await request('/api/costs/add', postData, { showNotify: true });

    //     $cost.find(`[name]`).each(resetValue);
    // });

    // $('#js-income-add').click(async () => {
    //     const $income = $('#js-incomes-container');

    //     const item = $income.find(`[name=item]`).val();
    //     const sum = $income.find(`[name=sum]`).val();
    //     const comment = $income.find(`[name=comment]`).val();

    //     const postData = { sum, comment, item };

    //     await request('/api/income/add', postData, { showNotify: true });

    //     $income.find(`[name]`).each(resetValue);
    // });

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

        clearCanvas(canvas1);
        clearCanvas(canvas2);
        clearCanvas(canvas3);

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
                    data: Object.values(body).map(item => Math.round(item.proceeds)),
                    fill: false,
                    borderColor: "#0088cc",
                    backgroundColor: "#34495e",
                    lineTension: 0.1
                }, {
                    label: "Прибыль",
                    data: Object.values(body).map(item => Math.round(item.profit)),
                    fill: false,
                    borderColor: "#0088cc",
                    backgroundColor: "#34495e",
                    lineTension: 0.1
                },
                {
                    label: "Расходы",
                    data: Object.values(body).map(item => Math.round(item.totalCosts)),
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
                    data: Object.values(groupCosts).map(value => Math.round(value)),
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
                    data: Object.values(groupServices).map(value => Math.round(value)),
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


        function clearCanvas(canvas) {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

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
    /* */
    $('#js-cars-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const $inputs = $form.find('[name]');
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-cars-table').length) {
            $('#js-cars-table')
                .dataTable()
                .fnAddData([data.name, data.model, data.number, `<a href="/cars/${data.id}" target="_blank">Подробнее</a>`]);
        } else {

            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })

            if ($('.js-editable-body').hasClass('editable-on')) {
                $('.js-toggleEditable').click();
            }
        }

        return false;
    })

    $('#js-customers-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        if ($('#js-customers-table').length) {
            $('#js-customers-table')
                .dataTable()
                .fnAddData([data.is_legal_entity, data.name, `<a href="/customers/${data.id}" target="_blank">Подробнее</a>`]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-passengers-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);
        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();


        if ($('#js-clients-table').length) {
            insertTable('clients', data.id, [data.name, data.contact_number]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-drivers-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-drivers-table').length) {
            insertTable('drivers', data.id, [data.name, data.contact_number]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-itineraries-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);
        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-itineraries-table').length) {
            insertTable('itineraries', data.id, [data.name, data.price]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-costs-categories-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);
        const { values: data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-costs-categories-table').length) {
            insertTable('costs-categories', data.id, [data.title]);
        } else {
            Object.keys(data).forEach(key => $form.find(`[data-target=${key}]`).text(data[key]));
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-cashStorages-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-cash-storages-table').length) {
            insertTable('cash-storages', data.id, [data.cashbox, data.name, data.number]);
        } else {
            Object.keys(data).forEach(key => $form.find(`[data-target=${key}]`).text(data[key]));
            $('.js-toggleEditable').click();
        }


        return false;
    })

    $('#js-additionalServices-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });
        $(e.target).find('.modal-dismiss').click();

        if ($('#js-additional-services-table').length) {
            insertTable('additional-services', data.id, [data.name, data.price]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }


        return false;
    })

    $('#js-apartments-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        if ($('#js-apartments-table').length) {
            insertTable('apartments', data.id, [data.address, data.rooms, data.price_per_day, data.statusName]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })
            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-price-list-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        if ($('#js-price-list-table').length) {
            insertTable('price-list', data.id, [`${data.name} ${data.model}`, data.price_per_day, data.limit_per_day, data.surcharge]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })

            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-carReservations-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        if ($('#js-carReservations-table').length) {
            // insertTable('carReservations', data.id, [`${data.name} ${data.model}`, data.price_per_day, data.limit_per_day, data.surcharge]);
            location.reload();
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })

            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-incomes-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        if ($('#js-incomes-table').length) {
            insertTable('incomes', data.id, [data.date, data.id, data.customer_name, data.base, data.sum, data.cashbox_name]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })

            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-costs-add-form').on('submit', async function (e) {
        e.preventDefault();

        const $form = $(this);
        const url = $form.attr('action');

        const values = getFormValues($form);

        const { data } = await request(url, { values }, { showNotify: true });

        $(e.target).find('.modal-dismiss').click();

        console.log(data);

        if ($('#js-costs-table').length) {
            insertTable('costs', data.id, [data.date, data.id, data.toCost, data.category, data.cashbox_name, data.sum]);
        } else {
            Object.keys(data).forEach(key => {
                $form.find(`[data-target=${key}]`).text(data[key]);
            })

            $('.js-toggleEditable').click();
        }

        return false;
    })

    $('#js-carReserv-complete').on('click', async function () {
        const $btn = $(this);
        const { id } = $btn.data();

        const { data } = await request('/api/carReservations/update', { values: { id, status: 2 } });

        location.reload();
    })

    $('#js-apartmentReserv-view-complete').on('click', async function () {
        const $btn = $(this);
        const { id } = $btn.data();

        const { data } = await request('/api/apartmentReservations/update', { values: { id, status: 3 } });

        location.reload();
    })

    $('.js-tableEssence-remove').on('click', async function (e) {

        const $btn = $(this);

        if (!confirm('Подтвердить удаление?'))
            return false;

        const { id, target } = $btn.data();

        if (!id) {
            alert('Что-то пошло не так. Попробуйте позже');
            console.log('Отсутствует id');
            return false;
        }

        if (!target) {
            alert('Что-то пошло не так. Попробуйте позже');
            console.log('Отсутствует target');
            return false;
        }

        const { data } = await request('/api/' + target + '/delete', { id });

        window.close();
    })

    $('.js-toggleEditable').on('click', function (e) {
        e.preventDefault();
        $('.js-editable-body').toggleClass('editable-on');
        return false;
    })

    const loadSalaryTable = (data) => {
        return request('/api/salaryStatement/getTable', data);
    };

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

    // 
    var $count = $('input[name="count"]');
    $count.on('input', function () {
        var value = $count.val()
        if (Number.isInteger(value)) {
            return;
        } else {
            $count.val(Math.round($count.val()));
        }
    })
});

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

function getFormValues(form, selectors = 'textarea:not(:hidden), select:not(:hidden), input:not(:hidden), input[type=hidden]') {

    const arrayData = $(form).find(selectors).serializeArray();

    const values = {};

    arrayData.reduce((acc, item) => {

        const { name, value } = item;

        if ((name == 'email' || name == 'contact_number') && !value) {
            return acc;
        }

        if (acc[name] && !value) {
            return acc;
        }

        acc[name] = acc[name]
            ? [...acc[name].split(','), value].join(',')
            : value;

        return acc;
    }, values);

    return values;
};


const insertTable = (name, id, values = []) => {
    $('#js-' + name + '-table')
        .dataTable()
        .fnAddData([...values, `<a href="/${name}/${id}" target="_blank">Подробнее</a>`]);
}

const Employee = {
    submit_form: async (form) => {
        const values = getFormValues(form);

        const data = await request('/api/employees/add', values);

        if (data.status == 'ok') {
            location.reload();
        }

        return false;
    },

    update_form: async (form) => {

        const values = getFormValues(form);

        const data = await request('/api/employees/update', values);

        console.log(data);

        if (data.status == 'ok') {
            location.reload();
        }

        return false;
    },

    fired: async (employee_id) => {
        if (!confirm('Уволить сотрудника?')) {
            return false;
        }

        await request('/api/employees/updateTarget', { is_fired: 1, id: employee_id });

        location.reload();
    },

    come: async (employee_id) => {
        if (!confirm('Вернуть сотрудника?')) {
            return false;
        }

        await request('/api/employees/updateTarget', { is_fired: 0, id: employee_id });

        location.reload();
    }
};

const Suppliers = {

    addUrl: '/api/suppliers/add',
    updateUrl: '/api/suppliers/update',

    async add_form_submit(form) {

        const values = getFormValues(form);

        const { data } = await request(this.addUrl, values, { showNotify: true });

        $('#js-suppliers-table')
            .dataTable()
            .fnAddData([data.is_legal_entity, data.name, `<a href="/suppliers/${data.id}" target="_blank">Подробнее</a>`]);

        return false;
    },

    async update_form_submit(form) {
        const values = getFormValues(form);

        const { data } = await request(this.updateUrl, values, { showNotify: true });

        Object.keys(data).forEach(key => {
            $(form).find(`[data-target=${key}]`).text(data[key]);
        });

        $('.js-toggleEditable').click();

        return false;
    }

};
const SuppliersPositions = {

    async add_form_submit(form) {

        const $form = $(form);
        const values = getFormValues(form);

        const { data } = await request($form.attr('action'), values, { showNotify: true });

        $('#js-suppliers-positions-table')
            .dataTable()
            .fnAddData([data.name, data.cost, `<a href="/suppliers-positions/${data.id}">Подробнее</a>`]);

        return false;
    },

    async update_form_submit(form) {

        const $form = $(form);
        const values = getFormValues(form);

        const { data } = await request($form.attr('action'), values, { showNotify: true });

        Object.keys(data).forEach(key => {
            $(form).find(`[data-target=${key}]`).text(data[key]);
        });

        $('.js-toggleEditable').click();

        return false;
    }
};

const SuppliersDeals = {

    async add_form_submit(form) {

        const $form = $(form);
        const $table = $('#js-suppliers-deals-table');
        const values = getFormValues(form);

        const { data } = await request($form.attr('action'), values, { showNotify: true });

        $table.dataTable()
            .fnAddData([
                data.date,
                data.supplier_name,
                data.position_name,
                data.sum,
                `<a href="/suppliers/${data.id}" target="_blank">Подробнее</a>`
            ]);

        $form.find('[name]').val("").trigger('change');

        return false;
    },
};

const contactsShiftAdd = async (form) => {

    const $form = $(form);
    const $dribersBlocks = $form.find('.js-contract-driver-block');
    const date_start = $form.find('[name=date_start]').val();
    const contract_id = $form.find('[name=contract_id]').val();
    const comment = $form.find('[name=comment]').val();

    if (!date_start) {
        return alert('Не выбрана дата начала смены');
    }

    const drivers = [];

    $dribersBlocks.each((index, driverBlock) => {
        const $driverBlock = $(driverBlock);

        const driver_id = $driverBlock.find('[name=driver_id]').val();
        const type = $driverBlock.find('[name=type]').val();
        const object = $driverBlock.find('[name=object]').val();
        const value = $driverBlock.find('[name=value]').val();

        drivers.push({ driver_id, type, object, value });
    });

    const { data } = await request('/api/contract-shifts/add', { drivers, contract_id, date_start, comment });

    location.reload();

    return false;
};

const contactsShiftUpdate = async (form) => {

    const $form = $(form);

    let t = getFormValues(form);

    const $dribersBlocks = $form.find('.js-contract-driver-block');
    const comment = $form.find('[name=comment]').val();

    const drivers = [];

    $dribersBlocks.each((index, driverBlock) => {
        const $driverBlock = $(driverBlock);

        const driver_id = $driverBlock.find('[name=driver_id]').val();
        const type = $driverBlock.find('[name=type]').val();
        const object = $driverBlock.find('[name=object]').val();
        const value = $driverBlock.find('[name=value]').val();
        const hours = $driverBlock.find('[name=hours]').val();
        const id = $driverBlock.find('[name=id]').val();

        drivers.push({ driver_id, type, object, value, hours, id });
    });

    const { data } = await request('/api/drivers2shifts/update', { drivers, comment });

    location.reload();

    return false;
};

const closeShift = async (id) => {
    await request('/api/contract-shifts/close', { id });
    location.reload();
};

const closeContract = async (id) => {
    await request('/api/muz-contracts/close', { id });
    location.reload();
}

const updateContract = async (form) => {

    const $form = $(form);

    const customer_id = $form.find('[name=customer_id]').val();
    const total_value = $form.find('[name=total_value]').val();
    const cash_security = $form.find('[name=cash_security]').val();
    const total_hours = $form.find('[name=total_hours]').val();
    const id = $form.find('[name=id]').val();
    const comment = $form.find('[name=comment]').val();

    const postData = {
        comment,
        customer_id, 
        total_value, 
        cash_security, 
        total_hours, 
        id,
    };

    $('.js-types-hours').each((index, element) => {
        const $element = $(element);

        const type = $element.data('type');
        const hours = $element.find('[name=' + type + '_hours]').val();
        const value = $element.find('[name=' + type + '_value]').val();

        postData[type + '_hours'] = hours || null;
        postData[type + '_value'] = value || null;

        if (type === 'other') {
            postData['other_name'] = $element.find('[name=other_name]').val();
        }
    });

    // console.log(postData);
    // console.log(postData);
    await request('/api/muz-contracts/update', postData);
    location.reload();
}