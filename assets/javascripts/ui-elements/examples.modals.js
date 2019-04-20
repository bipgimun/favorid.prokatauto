

(function ($) {

    'use strict';

	/*
	Basic
	*/
    $('.modal-basic').magnificPopup({
        type: 'inline',
        preloader: false,
        modal: true
    });

	/*
	Sizes
	*/
    $('.modal-sizes').magnificPopup({
        type: 'inline',
        preloader: false,
        modal: true
    });

	/*
	Modal with CSS animation
	*/
    $('.modal-with-zoom-anim').magnificPopup({
        type: 'inline',

        fixedContentPos: false,
        fixedBgPos: true,

        overflowY: 'auto',

        closeBtnInside: true,
        preloader: false,

        midClick: true,
        removalDelay: 300,
        mainClass: 'my-mfp-zoom-in',
        modal: true
    });

    $('.modal-with-move-anim').magnificPopup({
        type: 'inline',

        fixedContentPos: false,
        fixedBgPos: true,

        overflowY: 'auto',

        closeBtnInside: true,
        preloader: false,

        midClick: true,
        removalDelay: 300,
        mainClass: 'my-mfp-slide-bottom',
        modal: true
    });

	/*
	Modal Dismiss
	*/
    $(document).on('click', '.modal-dismiss', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });

	/*
	Modal Confirm
	*/
    $(document).on('click', '.modal-confirm', function (e) {
        e.preventDefault();
        $.magnificPopup.close();

        new PNotify({
            title: 'Success!',
            text: 'Modal Confirm Message.',
            type: 'success'
        });
    });

	/*
	Form
	*/
    $('.modal-with-form').magnificPopup({
        type: 'inline',
        preloader: false,
        focus: '#name',
        modal: true,

        // When elemened is focused, some mobile browsers in some cases zoom in
        // It looks not nice, so we disable it:
        callbacks: {
            beforeOpen: function () {
                if ($(window).width() < 700) {
                    this.st.focus = false;
                } else {
                    this.st.focus = '#name';
                }

                $('select.js-select2-init').select2({
                    allowClear: true,
                    dropdownParent: $('#add-products')
                });

                $('#js-select2-customer-id').select2({
                    allowClear: true,
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/customers/get',
                        dataType: 'json',
                        type: "POST",
                        quietMillis: 50,
                        processResults: function (data) {
                            return {
                                results: $.map(data.customers, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-clients-id').select2({
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/clients/get',
                        type: "POST",
                        dataType: 'json',
                        processResults: function (data) {
                            return {
                                results: $.map(data.clients, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-apartments-id').select2({
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/apartments/get',
                        type: "POST",
                        dataType: 'json',
                        processResults: function (data) {
                            return {
                                results: $.map(data.data, function (item) {
                                    return {
                                        text: item.address,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-cashStorages-id').select2({
                    allowClear: true,
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/cashStorages/get',
                        dataType: 'json',
                        type: "POST",
                        quietMillis: 50,
                        processResults: function (data) {
                            return {
                                results: $.map(data.data, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });

                $('#js-select2-services-id').select2({
                    dropdownParent: $('#add-products'),
                    ajax: {
                        url: '/api/additionalServices/get',
                        dataType: 'json',
                        type: "POST",
                        quietMillis: 50,
                        processResults: function (data) {
                            return {
                                results: $.map(data.data, function (item) {
                                    return {
                                        text: item.name,
                                        id: item.id
                                    }
                                })
                            }
                        }
                    }
                });
            }
        }
    });

	/*
	Ajax
	*/
    $('.simple-ajax-modal').magnificPopup({
        type: 'ajax',
        modal: true
    });

}).apply(this, [jQuery]);