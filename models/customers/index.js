const db = require('../../libs/db');

exports.get = async ({
    id = ''
} = {}) => {
    const customers = await db.execQuery(`
        SELECT * 
        FROM customers
        WHERE id > 0
            ${id ? `AND id = ${id}` : ''}
    `);

    customers.forEach(customer => {
        const emails = (customer.email || '').split(',');
        const phones = (customer.contact_number || '').split(',');

        const [mainEmail, ...otherEmails] = emails;
        const [mainPhone, ...otherPhones] = phones;

        customer.email = mainEmail || '';
        customer.otherEmails = otherEmails || [];
        
        customer.contact_number = mainPhone || '';
        customer.otherPhones = otherPhones || [];
    })

    return customers;
};