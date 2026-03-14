// config.js

const config = {
    // --- INFORMASI OWNER ---
    ownerNumber: "6282133692292", // Nomor kamu (tanpa @s.whatsapp.net)
    ownerLid: "83227876290608", // Linked Identify WhatsApp
    ownerName: "Kii",
    
    // --- PENGATURAN BOT ---
    botName: "Viel Bot",
    sessionName: "session_esm", // Nama folder untuk menyimpan login
    
    // --- PENGATURAN PUSH KONTAK ---
    delay: {
        min: 7000,  // Jeda minimal (7 detik)
        max: 15000  // Jeda maksimal (15 detik)
    },
    
    // --- PESAN OTOMATIS ---
    msgWait: "🚀 Proses Push dimulai... Mohon tunggu ya kak.",
    msgDone: "✅ Alhamdulillah, proses push kontak sudah selesai!",
    msgError: "❌ Waduh, sepertinya ada masalah saat mengirim pesan."
};

export default config;