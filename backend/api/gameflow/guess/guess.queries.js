const pool = require('#sql/connection.js');

async function saveGuess(connection, sessionId, pointId, mapId, guessu, guessv, distanceError, score, cycle, round) {
    const query = `
        INSERT INTO session_guesses (session_id, point_id, map_id, guessed_u, guessed_v, distance_error, points_awarded, cycle, round)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(query, [sessionId, pointId, mapId, guessu, guessv, distanceError, score, cycle, round]);
    return result.insertId;
}

async function totalScore(sessionId) {
    const query = `
        SELECT SUM(points_awarded) AS total_score
        FROM session_guesses
        WHERE session_id = ?
    `;
    const [result] = await pool.execute(query, [sessionId]);
    return result[0].total_score || 0;
}

async function incrementCurrentRound(connection, sessionId) {
    const query = `
        UPDATE game_sessions
        SET current_round = current_round + 1
        WHERE session_id = ?
    `;
    const [result] = await connection.execute(query, [sessionId]);
    return result;
}

async function clearCurrentPoint(connection, sessionId) {
    const query = `UPDATE game_sessions SET current_point_id = NULL WHERE session_id = ?`;
    await connection.execute(query, [sessionId]);
}

module.exports = { saveGuess, totalScore, incrementCurrentRound, clearCurrentPoint };
