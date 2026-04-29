const pool = require('../connection.js');

//!SQL Queries

async function getUserCount() {
    try {
        const queryUserCount = 'SELECT COUNT(*) AS jatekosok_szama FROM users;'
        const [oldImageData] = await pool.execute(queryUserCount);
        return oldImageData[0].jatekosok_szama;
    } catch (error) {
        console.error('DB hiba getUserNumbers:', error);
        throw error;
    }
}

async function getActiveUserCount() {
    try {
        const queryUserCount = "SELECT COUNT(DISTINCT log.user_id) AS egyedi_belepok_szama FROM log WHERE log.activity = 'Login' AND log.happened_at >= DATE_SUB(NOW(), INTERVAL 31 DAY);";
        const [result] = await pool.execute(queryUserCount);
        return result[0].egyedi_belepok_szama;
    } catch (error) {
        console.error('DB hiba getUserNumbers:', error);
        throw error;
    }
}

async function getUserActivityByDay() {
    try {
        const queryUserCount = `
            SELECT 
                DATE_FORMAT(calendar.nap, '%m.%d.') AS datum, 
                COUNT(log.log_id) AS felhasznalok_szama
            FROM (
                SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY AS nap
                FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
                CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1) AS b
            ) AS calendar
            LEFT JOIN log ON DATE(log.happened_at) = calendar.nap AND log.activity LIKE '%Login%'
            GROUP BY calendar.nap
            ORDER BY calendar.nap
            LIMIT 20;
            `;
        const [result] = await pool.execute(queryUserCount);
        return result;
    } catch (error) {
        console.error('DB hiba getUserActivityByDay:', error);
        throw error;
    }
}

async function getUserActivityByWeek() {
    try {
        const queryWeeklyLogins = `
        SELECT 
            calendar.het_megnevezes,
            COUNT(log.log_id) AS bejelentkezesek_szama
        FROM (
            -- Utolsó 12 hét generálása (hétfői kezdéssel)
            SELECT 
                YEARWEEK(CURDATE() - INTERVAL (a.a) WEEK, 1) AS het_kod,
                DATE_FORMAT(CURDATE() - INTERVAL (a.a) WEEK, '%v.') AS het_megnevezes
            FROM (
                SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 
                UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            ) AS a
        ) AS calendar
        LEFT JOIN log ON YEARWEEK(log.happened_at, 1) = calendar.het_kod AND log.activity LIKE '%Login%'
        GROUP BY calendar.het_kod
        ORDER BY calendar.het_kod ASC;
`;
        const [result] = await pool.execute(queryWeeklyLogins);
        return result;
    } catch (error) {
        console.error('DB hiba getUserActivityByWeek:', error);
        throw error;
    }
}

async function getRegistrationByWeek() {
    try {
        const queryUserRegistrationByWeek = `
        SELECT 
            calendar.het_szama AS het_megnevezes,
            COUNT(users.user_id) AS regisztraciok_szama
        FROM (
            SELECT 
                YEARWEEK(CURDATE() - INTERVAL (a.a) WEEK, 1) AS het_kod,
                DATE_FORMAT(CURDATE() - INTERVAL (a.a) WEEK, '%v.') AS het_szama
            FROM (
                SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 
                UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            ) AS a
        ) AS calendar
        LEFT JOIN users ON YEARWEEK(users.created_at, 1) = calendar.het_kod
        GROUP BY calendar.het_kod
        ORDER BY calendar.het_kod ASC;
        `;
        const [result] = await pool.execute(queryUserRegistrationByWeek);
        return result;
    } catch (error) {
        console.error('DB hiba getRegistrationByWeek:', error);
        throw error;
    }
}

async function getMatchCountByWeek() {
    try {
        const queryMatchCountByWeek = `
        SELECT 
            calendar.het_szama AS het_megnevezes,
            COUNT(score.score_id) AS meccsek_szama
        FROM (
            SELECT 
                YEARWEEK(CURDATE() - INTERVAL (a.a) WEEK, 1) AS het_kod,
                DATE_FORMAT(CURDATE() - INTERVAL (a.a) WEEK, '%v.') AS het_szama
            FROM (
                SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 
                UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            ) AS a
        ) AS calendar
        LEFT JOIN score ON YEARWEEK(score.score_time, 1) = calendar.het_kod
        GROUP BY calendar.het_kod
        ORDER BY calendar.het_kod ASC;
        `;
        const [result] = await pool.execute(queryMatchCountByWeek);
        return result;
    } catch (error) {
        console.error('DB hiba getMatchCountByWeek:', error);
        throw error;
    }
}

module.exports = {
    getUserCount,
    getActiveUserCount,
    getUserActivityByDay,
    getUserActivityByWeek,
    getRegistrationByWeek,
    getMatchCountByWeek
}