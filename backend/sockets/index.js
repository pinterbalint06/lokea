const onlineUsers = new Map();

module.exports = (io, sessionMiddleware) => {
    io.engine.use(sessionMiddleware);

    io.on("connection", (socket) => {
        const session = socket.request.session;
        const userId = session ? session.userid : null;

        socket.emit("totalOnline", onlineUsers.size);

        if (userId) {
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
                onlineUsers.get(userId).add(socket.id);

                io.emit("totalOnline", onlineUsers.size);
            } else {
                onlineUsers.get(userId).add(socket.id);
            }
        }

        socket.on("disconnect", () => {
            if (userId && onlineUsers.has(userId)) {
                const userSockets = onlineUsers.get(userId);
                userSockets.delete(socket.id);

                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                }

                io.emit("totalOnline", onlineUsers.size);
            }
        });
    });
};
