import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import config from './config.js';

async function startBot() {
    // 1. Inisialisasi Auth State
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
        // Agar terdeteksi sebagai perangkat stabil di Panel
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 2. Logika Pairing Code
    if (!sock.authState.creds.registered) {
        console.log(`\n\x1b[33m[!] Menyiapkan Pairing Code untuk: ${config.ownerNumber}\x1b[0m`);
        setTimeout(async () => {
            let code = await sock.requestPairingCode(config.ownerNumber);
            console.log(`\n\x1b[32m[+] KODE PAIRING ANDA:\x1b[0m \x1b[1m${code}\x1b[0m\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // 3. Handler Koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(`[!] Koneksi terputus (Reason: ${reason}). Reconnecting...`);
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('\n\x1b[32m[✅] BOT BERHASIL TERHUBUNG KE WHATSAPP\x1b[0m');
            console.log(`\x1b[36m[i] Halo ${config.ownerName}, bot sudah siap digunakan.\x1b[0m\n`);
        }
    });

    // 4. Main Message Handler
    sock.ev.on('messages.upsert', async (chat) => {
        try {
            const m = chat.messages[0];
            if (!m.message) return;

            // Menangani berbagai jenis struktur pesan WhatsApp (Teks, Caption, Extended)
            const body = (
                m.message.conversation || 
                m.message.extendedTextMessage?.text || 
                m.message.imageMessage?.caption || 
                m.message.videoMessage?.caption || 
                m.message.viewOnceMessageV2?.message?.imageMessage?.caption ||
                m.message.viewOnceMessageV2?.message?.videoMessage?.caption ||
                ""
            ).trim();

            const from = m.key.remoteJid;

            // Debug Log - Sekarang kurung ini tidak akan kosong lagi
            if (body) console.log(`📩 Pesan Masuk: [${body}] dari ${from}`);

            // Cek apakah pesan diawali prefix titik (.)
            if (!body.startsWith('.')) return; 

            const command = body.split(' ')[0].toLowerCase();
            const args = body.split(' ').slice(1).join(' ');

            // 5. Plugin Loader Dinamis
            const pluginFolder = path.join(process.cwd(), 'plugins');
            const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

            for (const file of pluginFiles) {
                try {
                    const pluginPath = pathToFileURL(path.join(pluginFolder, file)).href;
                    const plugin = await import(`${pluginPath}?update=${Date.now()}`);

                    // Jalankan plugin jika command terdaftar
                    if (plugin.default && plugin.default.command && plugin.default.command.includes(command)) {
                        await plugin.default.run(sock, m, args, config);
                        break; // Stop loop jika plugin sudah ditemukan
                    }
                } catch (err) {
                    console.error(`❌ Gagal memuat plugin ${file}:`, err.message);
                }
            }
        } catch (err) {
            console.error(`[Error Global]:`, err);
        }
    });
}

// Start
console.log('\x1b[36m[i] Memulai bot... Pastikan kamu sudah memindai QR Code dan terhubung ke WhatsApp.\x1b[0m\n');
startBot();