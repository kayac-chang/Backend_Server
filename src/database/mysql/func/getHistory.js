
// ===================================
const findHistory = require('../sql/findHistory');

const Record = require('../../../model/record');
// ===================================

async function getHistory(db, date) {
    const result = await db.query(findHistory(date));

    return result
        .map((row) => Record({date, ...row}))
        .sort((a, b) => b.uid - a.uid);
}

// ===================================
module.exports = getHistory;
