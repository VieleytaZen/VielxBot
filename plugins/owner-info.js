// plugins/owner-info.js
export default {
    command: ['.owner', '.creator'],
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;
        
        // Membersihkan nomor (hanya ambil angka saja)
        const cleanNumber = config.ownerNumber.replace(/\D/g, '');

        const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    `FN:${config.ownerName}\n` +
                    `ORG:Owner ${config.botName};\n` +
                    `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\n` +
                    'END:VCARD';

        await sock.sendMessage(from, {
            contacts: {
                displayName: config.ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: msg });
    }
};