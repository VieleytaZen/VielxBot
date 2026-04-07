// index.js
// Script ini di buat oleh Viel, jangan di hapus credit nya ya kak 🙏

import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import config from './config.js';

// Import fungsi penanganan pesan dari handler.js
import { messageHandler } from './handler.js';

// --- SISTEM ANTI-CRASH ---
process.on('uncaughtException', function (err) {
    console.error('\x1b[31m[ANTI-CRASH] Terjadi error (uncaughtException):\x1b[0m', err.message);
});
process.on('unhandledRejection', function (err) {
    console.error('\x1b[31m[ANTI-CRASH] Terjadi error (unhandledRejection):\x1b[0m', err.message);
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Menangani Pairing Code
    if (!sock.authState.creds.registered) {
        console.log(`\x1b[33m[!] Menyiapkan Pairing Code...\x1b[0m`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(config.ownerNumber);
                console.log(`\x1b[32m[+] PAIRING CODE:\x1b[0m \x1b[1m${code}\x1b[0m`);
            } catch (e) { console.log("Gagal pairing."); }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // Menangani Koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Koneksi terputus, mencoba menyambungkan kembali...");
                startBot(); // Hubungkan ulang jika terputus
            } else {
                console.log("Kamu telah logout. Silakan hapus folder sesi dan sambungkan ulang.");
            }
        } else if (connection === 'open') {
            console.log('\n\x1b[32m[✅] BOT CONNECTED\x1b[0m');
        }
    });

    // --- MENERUSKAN PESAN KE HANDLER ---
    sock.ev.on('messages.upsert', async (chat) => {
        // Panggil fungsi messageHandler dari handler.js dan berikan data socket dan pesan
        await messageHandler(sock, chat);
    });
}

startBot();