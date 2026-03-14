sock.ev.on('messages.upsert', async (chat) => {
    try {
        const m = chat.messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const sender = m.key.participant || from;

        // --- 1. LOGIKA AUTO-CAPTURE (PENTING) ---
        // Jika ada orang yang chat/balas, kita tangkap identitasnya
        // Baileys sering memberikan LID di 'sender' dan nomor asli di 'm.pushName' 
        // atau dalam struktur 'm.key'
        if (sender.includes('@s.whatsapp.net')) {
            db.addContact(sender); 
        }

        // --- 2. LOGIKA UPDATE LID (Jika pesan adalah balasan/quoted) ---
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const lidSender = m.message.extendedTextMessage?.contextInfo?.participant;
        
        if (lidSender?.includes('@lid') && sender.includes('@s.whatsapp.net')) {
            db.updateLidToNumber(lidSender, sender);
        }

        // --- 3. PENGAMBILAN TEXT BODY ---
        let body = (
            m.message.conversation || 
            m.message.extendedTextMessage?.text || 
            m.message.imageMessage?.caption || 
            m.message.videoMessage?.caption || 
            m.message.viewOnceMessageV2?.message?.imageMessage?.caption ||
            m.message.viewOnceMessageV2?.message?.videoMessage?.caption ||
            ""
        ).trim();

        if (m.key.fromMe && !body) {
            body = (m.message.quotedMessage?.conversation || 
                    m.message.quotedMessage?.extendedTextMessage?.text || 
                    "").trim();
        }

        if (body) {
            console.log(`📩 Pesan Masuk: [${body}]`);
            console.log(`   Dari: ${from}`);
            console.log(`   Oleh: ${sender}`);
        }

        // --- 4. FILTER COMMAND ---
        if (!body.startsWith('.')) return; 

        const command = body.split(' ')[0].toLowerCase();
        const args = body.split(' ').slice(1).join(' ');

        const pluginFolder = path.join(process.cwd(), 'plugins'); 
        if (!fs.existsSync(pluginFolder)) return;

        const pluginFiles = fs.readdirSync(pluginFolder).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            try {
                const pluginPath = pathToFileURL(path.join(pluginFolder, file)).href;
                const imported = await import(`${pluginPath}?update=${Date.now()}`);
                const plugin = imported.default || imported;

                if (plugin && plugin.command && plugin.command.includes(command)) {
                    console.log(`⚡ Menjalankan: ${file} untuk perintah [${command}]`);
                    await plugin.run(sock, m, args, config);
                    return; 
                }
            } catch (err) {
                console.error(`❌ Gagal memuat plugin ${file}:`, err.message);
            }
        }
    } catch (err) {
        console.error(`[Error Global]:`, err);
    }
});