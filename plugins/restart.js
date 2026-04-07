// plugins/restart.js

export default {
    // Daftar perintah untuk memicu plugin ini
    command: ['.restart'], 
    
    // Fungsi utama yang akan dijalankan oleh handler
    run: async (sock, m, args, config) => {
        const from = m.key.remoteJid;
        const sender = m.key.participant || from;

        // 1. Cek apakah yang mengirim pesan adalah Owner
        if (!sender.includes(config.ownerNumber)) {
            return await sock.sendMessage(from, { text: "Maaf, fitur ini khusus Owner!" }, { quoted: m });
        }
        
        // 2. Kirim pesan pemberitahuan
        await sock.sendMessage(from, { text: "🔄 Sedang merestart bot... Mohon tunggu sebentar." }, { quoted: m });
        console.log("Memicu restart dari command plugin...");
        
        // 3. Matikan proses Node.js
        // Karena kamu memakai panel (Pterodactyl), bot akan otomatis hidup kembali
        process.exit(1); 
    }
};