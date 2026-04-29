const pool = require('../connection.js');

//!SQL Queries

async function getAdminSettings(user_id) {
    try {
        let row;
        const queryUserCount = "SELECT darkmode, selected_chart FROM admin_settings WHERE admin_id = ?";
        const [rows] = await pool.execute(queryUserCount, [user_id]);
        if (rows && rows.length > 0) {
            row = { darkmode: rows[0].darkmode, selectedChart: rows[0].selected_chart };
        }
        return row;
    } catch (error) {
        console.error('DB hiba getAdminSettings:', error);
        throw error;
    }
}

async function updateAdminSettings(user_id, darkmode, selected_chart) {
    let connection;
    let result;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = `
            INSERT INTO admin_settings (admin_id, darkmode, selected_chart)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
            darkmode = IF(VALUES(darkmode) <=> darkmode, darkmode, VALUES(darkmode)),
            selected_chart = IF(VALUES(selected_chart) <=> selected_chart, selected_chart, VALUES(selected_chart))
        `;
        [result] = await connection.execute(query, [user_id, darkmode, selected_chart]);
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('DB hiba updateAdminSettings:', error);
        throw error;
    }
    finally {
        if (connection) connection.release();
    }
    return result.affectedRows;
}

async function updateDarkMode(user_id, darkmode) {
    let connection;
    let affectedRows = 0;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const query = `UPDATE users SET darkmode = ? WHERE user_id = ?`;
        const [result] = await connection.execute(query, [darkmode, user_id]);
        await connection.commit();
        affectedRows = result.affectedRows;
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }

    return affectedRows;
}

async function updateLanguage(user_id, language) {
    let connection;
    let affectedRows = 0;
    try {
        if (language) {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const query = `UPDATE users SET users.language = ? WHERE users.user_id = ?`;
            const [result] = await connection.execute(query, [language, user_id]);
            await connection.commit();
            affectedRows = result.affectedRows;
        }
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
    return affectedRows;
}

module.exports = {
    getAdminSettings,
    updateAdminSettings,
    updateDarkMode,
    updateLanguage
}