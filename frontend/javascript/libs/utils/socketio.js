let socket;

export async function initSocket() {
    if (typeof io === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    if (!socket) {
        socket = io();
        socket.on("totalOnline", (count) => {
            const el = document.getElementById("onlinePlayerCounter");
            if (el) el.innerText = `${count}`;
        });
    }
}