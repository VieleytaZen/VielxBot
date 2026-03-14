// plugins/exec.js
import { exec } from 'child_process';

export default {
    command: ['$', '=>', 'exec'], // Trigger bisa pakai simbol $ atau kata exec
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;

        // 1. KEAMANAN SUPER KETAT (Wajib Owner)
        const sender = msg.key.participant || msg.key.remoteJid || "";
        const isOwner = sender.includes(config.ownerNumber) || sender.includes(config.ownerLid);

        if (!isOwner) return; // Abaikan jika bukan owner

        // 2. Validasi Perintah
        if (!args) return sock.sendMessage(from, { text: "Masukkan perintah terminalnya, Bos!" });

        // 3. Proses Eksekusi Command
        // Contoh penggunaan: $ ls atau $ pm2 status
        exec(args, (error, stdout, stderr) => {
            if (error) {
                // Jika ada error saat menjalankan perintah
                return sock.sendMessage(from, { 
                    text: `❌ *ERROR*\n\n\`\`\`${error.message}\`\`\`` 
                }, { quoted: msg });
            }
            if (stderr) {
                // Jika ada error dari sistem terminal
                return sock.sendMessage(from, { 
                    text: `⚠️ *STDERR*\n\n\`\`\`${stderr}\`\`\`` 
                }, { quoted: msg });
            }
            
            // 4. Kirim Output Berhasil
            // Menggunakan format monospace (```) agar rapi seperti di terminal asli
            sock.sendMessage(from, { 
                text: `💻 *TERMINAL OUTPUT*\n\n\`\`\`${stdout}\`\`\`` 
            }, { quoted: msg });
        });
    }
};