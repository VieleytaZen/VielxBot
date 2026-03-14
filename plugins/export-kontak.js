// plugins/export-kontak.js
import fs from 'fs';
import { db } from '../database.js';

export default {
    command: ['.export', '.getnew'],
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid || "";
        const isOwner = sender.includes(config.ownerNumber) || sender.includes(config.ownerLid);

        if (!isOwner) return;

        const data = db.read();
        const exportedList = data.exportedContacts || [];
        const newContacts = data.pushedContacts.filter(jid => !exportedList.includes(jid));

        if (newContacts.length === 0) {
            return sock.sendMessage(from, { text: "⚠️ Tidak ada nomor baru untuk diekspor." }, { quoted: msg });
        }

        // Tentukan tipe: Default VCF agar bisa auto-save
        const type = args.toLowerCase() === 'txt' ? 'txt' : 'vcf';
        const fileName = `./Export_${Date.now()}.${type}`;

        if (type === 'vcf') {
            let vcardData = "";
            newContacts.forEach((jid, index) => {
                const num = jid.split('@')[0].split(':')[0]; // Ambil angka intinya saja
                vcardData += `BEGIN:VCARD\nVERSION:3.0\nFN:Push ${index + 1}\nTEL;type=CELL;waid=${num}:+${num}\nEND:VCARD\n`;
            });
            fs.writeFileSync(fileName, vcardData);

            // KIRIM SEBAGAI VCARD (PENTING!)
            await sock.sendMessage(from, { 
                document: fs.readFileSync(fileName), 
                fileName: `Kontak_Baru_${newContacts.length}.vcf`,
                mimetype: 'text/vcard', // Supaya muncul tombol "Save" di HP
                caption: `✅ Berhasil ekspor ${newContacts.length} nomor baru.\n\nKlik file di atas lalu pilih "Kontak" untuk simpan otomatis ke HP.`
            }, { quoted: msg });

        } else {
            const txtData = newContacts.map(jid => jid.split('@')[0]).join('\n');
            fs.writeFileSync(fileName, txtData);

            await sock.sendMessage(from, { 
                document: fs.readFileSync(fileName), 
                fileName: `Data_Nomor_${newContacts.length}.txt`,
                mimetype: 'text/plain'
            }, { quoted: msg });
        }

        // Tandai nomor sudah diekspor agar tidak double
        newContacts.forEach(jid => db.markAsExported(jid));
        fs.unlinkSync(fileName); // Hapus file sampah
    }
};