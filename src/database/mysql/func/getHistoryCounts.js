// ===================================
const findHistoryCounts = require('../sql/findHistoryCounts');

// ===================================

async function getHistoryCount(db, date) {
    const result = await db.query(findHistoryCounts(date));

    return result[0]['count'];
}

// ===================================
module.exports = getHistoryCount;
