  var inputsTel = document.querySelectorAll('.phone-input');
  var inputsDriverLicense = document.querySelectorAll('input[name="driver_license"]');
  var inputsPassport = document.querySelectorAll('.passport-vers_num-input');
  var inputsPassportDivisionCode = document.querySelectorAll('.passport-division_code-input');
  var inputsOgrn = document.querySelectorAll('.ogrn-input');

  Inputmask({
    "mask": "+7(999) 999-99-99",
    showMaskOnHover: true
  }).mask(inputsTel);

  /*Inputmask({
    "mask": "99-99-999999",
    showMaskOnHover: true
  }).mask(inputsDriverLicense);*/

  Inputmask({
    "mask": "99-99-999999",
    showMaskOnHover: true
  }).mask(inputsPassport);

  Inputmask({
    "mask": "999-999",
    showMaskOnHover: true
  }).mask(inputsPassportDivisionCode);

  Inputmask({
    "mask": "999999-9999999",
    showMaskOnHover: true
  }).mask(inputsOgrn);