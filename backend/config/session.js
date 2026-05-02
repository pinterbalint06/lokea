const session = require('express-session');

const SESSION_SECRET = process.env.SESSION_SECRET || 'session_titok';

const sessionMiddleware = session({
    name: 'geo.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV == 'production',
        maxAge: 60 * 60 * 1000
    }
});

module.exports = sessionMiddleware;
