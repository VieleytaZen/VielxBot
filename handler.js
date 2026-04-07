// handler.js
// File ini khusus untuk menangani pesan masuk dan menjalankan plugin

import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import { db } from './database.js'; // Pastikan path ini benar sesuai strukturmu
import config from './config.js';   // Pastikan path ini benar sesuai strukturmu

// Kita mengekspor fungsi ini agar bisa dipanggil dari index.js
export async function messageHandler(sock, chat) {
    try {
        const m = chat.messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const sender = m.key.participant || from;

        // --- AUTO-UPDATE LID ---
        if (sender.includes('@s.whatsapp.net')) {
            db.addContact(sender); 
            const quotedParticipant = m.message.extendedTextMessage?.contextInfo?.participant;
            if (quotedParticipant?.includes('@lid')) {
                db.updateLidToNumber(quotedParticipant, sender);
            }
        }

        // --- GET BODY ---
        let body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || 
            m.message.templateButtonReplyMessage?.selectedId || 
            m.message.buttonsResponseMessage?.selectedButtonId || 
            m.message.viewOnceMessageV2?.message?.imageMessage?.caption || 
            m.message.viewOnceMessageV2?.message?.videoMessage?.caption || 
            ""
        ).trim();

        // Log pesan masuk
        if (body) {
            console.log(`📩 Pesan: [${body}] | Dari: ${sender}`);
        }

        // --- FILTER PREFIX ---
        if (!body.startsWith('.') && !body.startsWith('$')) return;

        let command, args;
        if (body.startsWith('$')) {
            command = '$';
            args = body.slice(1).trim();
        } else {
            command = body.split(' ')[0].toLowerCase();
            args = body.split(' ').slice(1).join(' ');
        }

        // --- PLUGIN LOADER ---
        const pluginFolder = path.join(process.cwd(), 'plugins');
        const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            try {
                const pluginPath = pathToFileURL(path.join(pluginFolder, file)).href;
                const imported = await import(`${pluginPath}?update=${Date.now()}`);
                const plugin = imported.default || imported;

                if (plugin.command && plugin.command.includes(command)) {
                    console.log(`⚡ Exec: ${file} [${command}]`);
                    await plugin.run(sock, m, args, config);
                    return; // Hentikan pencarian jika plugin sudah ketemu
                }
            } catch (err) {
                console.error(`❌ Error pada plugin ${file}:`, err.message);
            }
        }
    } catch (e) { 
        console.error("[Error Upsert]:", e); 
    }
}