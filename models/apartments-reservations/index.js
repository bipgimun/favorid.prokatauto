const db = require('../../libs/db');

exports.get = ({
    id = '',
    ids = '',
    fromPeriod = '',
    endPeriod = '',
    customer = '',
    rentStart = '',
    rentFinished = '',

    passenger_id = '',
    apartment_id = '',
    manager_id = '',
    
    rentStartGt = '',
    rentStartLt = '',

    rentFinishedGt = '',
    rentFinishedLt = '',

    statuses = '',
    isArchive = null
}) => {
    return db.execQuery(`
         SELECT ar.*,
            a.address,
            p.name as client_name,
            c.name as customer_name,
            p.contact_number as client_number,
            CONCAT(e.last_name, ' ', e.first_name) as manager_name
        FROM apartment_reservations ar
            LEFT JOIN apartments a ON ar.apartment_id = a.id
            LEFT JOIN passengers p ON ar.passenger_id = p.id
            LEFT JOIN customers c ON ar.customer_id = c.id
            LEFT JOIN employees e ON ar.manager_id = e.id
        WHERE
            ar.id > 0
            ${id ? `AND ar.id = ${id}` : ''}
            
            ${passenger_id ? `AND ar.passenger_id = ${passenger_id}` : ''}
            ${apartment_id ? `AND ar.apartment_id = ${apartment_id}` : ''}
            ${manager_id ? `AND ar.manager_id = ${manager_id}` : ''}
            
            ${ids ? `AND ar.id IN (${ids})` : ''}
            ${fromPeriod ? `AND DATE(ar.created_at) >= '${fromPeriod}'` : ''}
            ${endPeriod ? `AND DATE(ar.created_at) <= '${endPeriod}'` : ''}

            ${statuses ? `AND ar.status IN (${statuses})` : ''}
            
            ${rentStart ? `AND ar.entry >= '${rentStart}'` : ''}
            ${rentFinished ? `AND ar.departure <= '${rentFinished}'` : ''}
            
            ${rentStartGt ? `AND ar.entry >= '${rentStartGt}'` : ''}
            ${rentStartLt ? `AND ar.entry <= '${rentStartLt}'` : ''}
            
            ${rentFinishedGt ? `AND ar.departure >= '${rentFinishedGt}'` : ''}
            ${rentFinishedLt ? `AND ar.departure <= '${rentFinishedLt}'` : ''}

            ${customer ? `AND ar.customer_id = ${customer}` : ''}
            ${
                isArchive === true 
                    ? `AND ar.status IN (3)` 
                    : isArchive === false 
                        ?  `AND ar.status NOT IN (3)` 
                        : ''
            }
    `);
}