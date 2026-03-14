// plugins/exec.js
import { exec } from 'child_process';
export default {
    // Ubah command agar diawali titik sesuai index.js kamu
    command: ['.shell', '.$', '.exec'], 
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;

        // 1. KEAMANAN OWNER (WAJIB)
        const sender = msg.key.participant || msg.key.remoteJid || "";
        const isOwner = sender.includes(config.ownerNumber) || sender.includes(config.ownerLid);

        if (!isOwner) return; 

        // 2. Validasi
        if (!args) return sock.sendMessage(from, { text: "Contoh: .$ ls" });

        // 3. Eksekusi
        exec(args, (error, stdout, stderr) => {
            if (error) {
                return sock.sendMessage(from, { text: `❌ *ERROR*\n\`\`\`${error.message}\`\`\`` });
            }
            if (stderr) {
                return sock.sendMessage(from, { text: `⚠️ *STDERR*\n\`\`\`${stderr}\`\`\`` });
            }
            
            sock.sendMessage(from, { 
                text: `💻 *TERMINAL*\n\n\`\`\`${stdout}\`\`\`` 
            }, { quoted: msg });
        });
    }
};