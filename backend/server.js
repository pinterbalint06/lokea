require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");

// alkalmazás modulok
const app = require('./app');
const setupSockets = require('./sockets');
const sessionMiddleware = require('#config/session.js');
const { i18nInitPromise } = require('#config/i18n.js');

// env változók
const IP = process.env.SERVER_IP || '127.0.0.1';
const PORT = process.env.PORT || 3000;

//! szerver és socket inicializálása
const server = http.createServer(app);
const io = new Server(server);

// websocket logika delegálása
setupSockets(io, sessionMiddleware);

//! szerver indítása
i18nInitPromise.then(() => {
    server.listen(PORT, IP, () => {
        console.log(`Szerver elérhetősége: http://${IP}:${PORT}`);
    });
}).catch(err => {
    console.error("Hiba az i18next inicializálása közben:", err);
});
