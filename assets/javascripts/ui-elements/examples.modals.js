

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

	/*
	Ajax
	*/
    $('.simple-ajax-modal').magnificPopup({
        type: 'ajax',
        modal: true
    });

}).apply(this, [jQuery]);