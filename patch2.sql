-- trello.com/c/uxjZOyva/131-73-в-сделках-с-поставщиками-suppliers-deals-добавлено-поле-номер-входящего-документа-которое-заполняется-вручную-при-добавлении
ALTER TABLE `suppliers_deals` ADD `incoming_document_number` VARCHAR(255) NULL DEFAULT NULL AFTER `position_id`;
