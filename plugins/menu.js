// plugins/menu.js
import fs from 'fs';
import path from 'path';

export default {
    command: ['.menu', '.help'],
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;

        // Ambil waktu saat ini untuk salam
        const hour = new Date().getHours();
        let salam = "Selamat Malam";
        if (hour >= 5 && hour < 11) salam = "Selamat Pagi";
        else if (hour >= 11 && hour < 15) salam = "Selamat Siang";
        else if (hour >= 15 && hour < 18) salam = "Selamat Sore";

        // 1. Baca folder plugins secara otomatis
        const pluginFolder = path.join(process.cwd(), 'plugins');
        const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

        let menuList = [];
        
        // 2. Ekstrak command dari setiap file
        for (const file of pluginFiles) {
            try {
                // Import file secara dinamis
                const module = await import(`file://${path.join(pluginFolder, file)}`);
                const plugin = module.default || module;
                
                if (plugin && plugin.command) {
                    // Ambil command pertama sebagai contoh (misal .stats)
                    const cmdName = Array.isArray(plugin.command) ? plugin.command[0] : plugin.command;
                    menuList.push(`│ ◦ ${cmdName}`);
                }
            } catch (e) {
                // Abaikan jika file tidak valid
            }
        }

        // 3. Susun Tampilan Menu
        let teks = `👋 *Hi ${config.ownerName}, ${salam}!*\n`;
        teks += `🤖 Saya adalah *${config.botName}*\n\n`;
        
        teks += `┌  ─── [ *LIST COMMAND* ]\n`;
        teks += menuList.join('\n');
        teks += `\n└  ───\n\n`;

        teks += `┌  ─── [ *INFO SYSTEM* ]\n`;
        teks += `│ ⏳ *Delay:* ${config.delay.min/1000} - ${config.delay.max/1000}s\n`;
        teks += `│ 🛡️ *Limit:* ${config.maxPushDay} / hari\n`;
        teks += `└  ───\n\n`;

        teks += `_Ketik salah satu perintah di atas untuk menggunakan fitur bot._`;

        await sock.sendMessage(from, { 
            text: teks,
            contextInfo: {
                externalAdReply: {
                    title: config.botName,
                    body: "WhatsApp Marketing Automation",
                    thumbnailUrl: "https://telegra.ph/file/241f71128399589d13695.jpg", // Ganti link foto jika mau
                    sourceUrl: "",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};