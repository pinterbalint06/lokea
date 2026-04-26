const pool = require('../connection.js');

//!SQL Queries

async function addLog(user_id, activity, victimid = null) {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        if (victimid == null) {
            const query = 'INSERT INTO log (user_id, activity) VALUES (?, ?)';
            await connection.execute(query, [user_id, activity]);
        }
        else {
            const query = 'INSERT INTO log (user_id, victim_id, activity) VALUES (?, ?, ?)';
            await connection.execute(query, [user_id, victimid, activity]);
        }
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
}

async function getLogs(limit = 15) {
    try {
        const countQuery = `SELECT COUNT(*) as total FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id`;
        const [[{ total }]] = await pool.execute(countQuery);

        const query = 'SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log INNER JOIN users who ON log.user_id = who.user_id LEFT JOIN users victim ON log.victim_id = victim.user_id ORDER BY log.happened_at DESC LIMIT ?';
        const [rows] = await pool.execute(query, [limit]);
        return { rows, total };
    } catch (error) {
        console.error('DB hiba getLogs:', error);
        throw error;
    }
}

async function sortedLogs(username, periodFrom, periodTo, roles, activities, page = 1, customLimit = 15) {
    const limit = customLimit;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (username && username.trim() !== "") {
        whereClause += ` AND (who.username LIKE ? OR victim.username LIKE ?)`;
        let searchStr = `%${username}%`;
        params.push(searchStr, searchStr);
    }

    if (periodFrom) {
        whereClause += ` AND log.happened_at >= ?`;
        params.push(periodFrom);
    }
    if (periodTo) {
        whereClause += ` AND log.happened_at <= ?`;
        params.push(periodTo);
    }

    if (roles && roles.length > 0) {
        let placeholders = roles.map(() => '?').join(',');
        whereClause += ` AND who.role IN (${placeholders})`;
        params.push(...roles);
    }

    if (activities && activities.length > 0) {
        let likeStrings = [];
        for (let i = 0; i < activities.length; i++) {
            likeStrings.push("log.activity LIKE ?");
            params.push("%" + activities[i] + "%");
        }
        whereClause += " AND (" + likeStrings.join(" OR ") + ")";
    }

    const countQuery = `SELECT COUNT(*) as total FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id WHERE 1=1 ${whereClause}`;

    const sortedLogQuery = `SELECT who.username, victim.username AS victim, log.activity, log.happened_at FROM log LEFT JOIN users AS who ON log.user_id = who.user_id LEFT JOIN users AS victim ON log.victim_id = victim.user_id WHERE 1=1 ${whereClause} ORDER BY log.happened_at DESC LIMIT ? OFFSET ?`;

    try {
        let [[{ total }]] = await pool.execute(countQuery, params);
        const finalParams = [...params, limit, offset];
        let [rows] = await pool.execute(sortedLogQuery, finalParams);

        return { rows, total };

    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

module.exports = {
    addLog,
    getLogs,
    sortedLogs
}