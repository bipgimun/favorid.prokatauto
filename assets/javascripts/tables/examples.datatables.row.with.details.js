
(function( $ ) {

	'use strict';

	var datatableInit = function() {
		var $table = $('#datatable-details');

		// format function for row details
		var fnFormatDetails = function( datatable, tr ) {
			var data = datatable.fnGetData( tr );

			return [
				'<table class="table mb-none">',
					'<tr class="b-top-none">',
						'<td><label class="mb-none">Класс:</label></td>',
						'<td>Бизнес</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Время:</label></td>',
						'<td>15:30</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Подробнее:</label></td>',
						'<td><a href="">Посмотреть заявку</a></td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Действие:</label></td>',
						'<td><a href="#">Удалить строку из подборки</a></td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">ДЛЯ КВАРТИР</label></td>',
						'<td>------------------</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Время заезда:</label></td>',
						'<td>21.05.2019 в 15:30</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Время выезда:</label></td>',
						'<td>23.05.2019 в 15:30</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Количество гостей:</label></td>',
						'<td>10 человек</td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Подробнее:</label></td>',
						'<td><a href="">Посмотреть заявку</a></td>',
					'</tr>',
					'<tr>',
						'<td><label class="mb-none">Действие:</label></td>',
						'<td><a href="#">Удалить строку из подборки</a></td>',
					'</tr>',
				'</div>'
			].join('');
		};

		// insert the expand/collapse column
		var th = document.createElement( 'th' );
		var td = document.createElement( 'td' );
		td.innerHTML = '<i data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>';
		td.className = "text-center";

		$table
			.find( 'thead tr' ).each(function() {
				this.insertBefore( th, this.childNodes[0] );
			});

		$table
			.find( 'tbody tr' ).each(function() {
				this.insertBefore(  td.cloneNode( true ), this.childNodes[0] );
			});

		// initialize
		var datatable = $table.dataTable({
			aoColumnDefs: [{
				bSortable: false,
				aTargets: [ 0 ]
			}],
			aaSorting: [
				[1, 'asc']
			]
		});

		// add a listener
		$table.on('click', 'i[data-toggle]', function() {
			var $this = $(this),
				tr = $(this).closest( 'tr' ).get(0);

			if ( datatable.fnIsOpen(tr) ) {
				$this.removeClass( 'fa-minus-square-o' ).addClass( 'fa-plus-square-o' );
				datatable.fnClose( tr );
			} else {
				$this.removeClass( 'fa-plus-square-o' ).addClass( 'fa-minus-square-o' );
				datatable.fnOpen( tr, fnFormatDetails( datatable, tr), 'details' );
			}
		});
	};

	$(function() {
		datatableInit();
	});

}).apply( this, [ jQuery ]);