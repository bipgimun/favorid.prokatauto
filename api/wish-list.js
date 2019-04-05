exports.wishList = {
    cars: [
        'name',
        'model',
        'class_name',
        'number',
        'mileage',
        'carcass_condition',
        'release_date',
        'fuel_level',
        'osago_number',
        'osago_expiration_date',
        'maintenance',
        'market_price',
        'purchase_price',
        'payment_amount',
        'payment_date',
        'in_leasing',
        'leasing_expiration_date',
    ],
    customers: [
        'is_legal_entity',
        'name',
        'requisites',
        'passport',
        'driver_license',
        'contact_number',
        'discount',
    ],
    passengers: [
        'name',
        'birthday',
        'contact_number'
    ],
    drivers: [
        'name',
        'birthday',
        'contact_number',
        'car_id',
        'driver_license',
        'license_date_issue',
        'license_date_expiration',
        'passport',
        'passport_date_issue',
        'passport_issued_by',
        'passport_division_code',
        'passport_location',
        'is_individual',
    ],
    itineraries: [
        'name',
        'price',
    ],
    cashStorages: [
        'cashbox',
        'name',
        'number',
    ],
    additionalServices: [
        'name',
        'price',
    ],
    apartments: [
        'address',
        'rooms',
        'price_per_day',
        'utilities_per_month',
    ],
    apartmentReservations: [
        'apartment_id',
        'customer_id',
        'passenger_id',
        'prepayment',
        'cash_storage_id',
        'services',
        'discount',
        'number_days',
        'price_per_day',
        'contact_number',
        'comment',
        'sum',
        'entry',
        'status',
        'departure',
    ]
};