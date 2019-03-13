const db = require('../db');

module.exports = async (params = new Params()) => {

    const comingGoods = await db.execQuery(`
        SELECT cg.*,
            g.title
        FROM coming_goods cg
            LEFT JOIN goods g ON g.id = cg.good_id
    `);

    const salesGoods = await db.execQuery(`
        SELECT sg.*,
            g.title
        FROM sales_goods sg
            LEFT JOIN goods g ON g.id = sg.good_id
    `);

    const salesGoodsGroup = salesGoods.reduce(countSalesByGoodId(), {});
    const comingCollapsed = comingGoods.reduce(collapseComing(salesGoodsGroup), {});

    const resData = Object.values(comingCollapsed)
        .map(expandComings())
        .sort(sortByAscendingRemnant());

    return resData;
};

function countSalesByGoodId() {
    return (acc, item) => {
        acc[item.good_id] = (acc[item.good_id] || 0) + Number(item.count);
        return acc;
    };
}

function collapseComing(salesGoodsGroup) {
    return (acc, item) => {

        const { good_id, count } = item;

        if (!acc[good_id]) {
            acc[good_id] = item;
            acc[good_id].cost = (salesGoodsGroup[good_id] || 0);
            acc[good_id].remnant = acc[good_id].count - (salesGoodsGroup[good_id] || 0);
            return acc;
        }

        acc[good_id].count += count;
        acc[good_id].remnant = acc[good_id].count - acc[good_id].cost;

        return acc;
    };
}


function expandComings() {
    return item => {
        return {
            id: +item.good_id,
            title: item.title,
            coming: +item.count,
            cost: +item.cost,
            remnant: +item.remnant,
            isRed: +item.remnant < 0,
            isOrange: +item.remnant <= 5,
        };
    };
}

function sortByAscendingRemnant() {
    return (a, b) => a.remnant - b.remnant;
}

class Params {
    constructor() {
        this.leftDate = new Date();
        this.rightDate = new Date();
    }
}
