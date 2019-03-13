/*Оборачиваешь необходимую форму в тэг формы. Назначаешь этой форме айдишник или класс
Затем пишешь скрипты
$('my-form').submit(function(e) {
$.post('/api/controller').done(function(result) {

});
return false;
})
$.post('/api/controller', { master, service, price, percent_master, percent_admin, comment }).done(function(result) { }
	var master = $('#master').val()*/

var WORKER = document.querySelector('');
var TYPE_OF_WORK = document.querySelector('');
var PRICE = document.querySelector('');
var WORKER_PERCENTAGE = document.querySelector('');
var ADMINISTARTOR_PERCENTAGE = document.querySelector('');
var COMMENTARY = document.querySelector('');

buttonSubmit.addEventListener('click', function sending () {
	var DATA_OBJ = {
		 'master': WORKER.value,
		 'service': TYPE_OF_WORK.value,
		 'price': PRICE.value,
		 'percent_master': WORKER_PERCENTAGE.value,
		 'percent_admin': ADMINISTARTOR_PERCENTAGE.value,
		 'comment': COMMENTARY.value
		}

	fetch('/api/salesServices/add', { body: DATA_OBJ })

});

