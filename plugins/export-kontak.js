// plugins/export-kontak.js
import { db } from '../database.js';
import fs from 'fs';

export default {
    command: ['.vcf', '.exportvcf'],
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;
        const data = db.read();
        const contacts = data.pushedContacts || [];

        if (contacts.length === 0) return sock.sendMessage(from, { text: "⚠️ Database kosong!" });

        let vcfContent = "";
        
        contacts.forEach((jid, index) => {
            const isLid = jid.includes('@lid');
            // Mengambil ID (baik itu nomor 628xxx atau ID LID 102xxx)
            const idOnly = jid.split('@')[0].split(':')[0];
            
            // Nama urut agar rapi di kontak
            const contactName = `Push ${index + 1} ${isLid ? '[LID]' : ''}`;
            
            vcfContent += `BEGIN:VCARD\n`;
            vcfContent += `VERSION:3.0\n`;
            vcfContent += `FN:${contactName}\n`;
            
            if (isLid) {
                // Jika LID, simpan sebagai ID WhatsApp khusus
                vcfContent += `TEL;TYPE=CELL;waid=${idOnly}:+${idOnly}\n`;
            } else {
                // Jika nomor biasa
                vcfContent += `TEL;TYPE=CELL:+${idOnly}\n`;
            }
            
            vcfContent += `END:VCARD\n`;
        });

        const fileName = './Hasil_Export.vcf';
        fs.writeFileSync(fileName, vcfContent);

        await sock.sendMessage(from, { 
            document: fs.readFileSync(fileName), 
            fileName: `Kontak_Vielx_${contacts.length}.vcf`,
            mimetype: 'text/vcard',
            caption: `✅ *Export Selesai*\n\nTotal: ${contacts.length} kontak.\n\n_Tips: Klik file ini, pilih "Buka dengan Kontak", lalu simpan. Kamu bisa langsung chat mereka via WhatsApp._`
        }, { quoted: msg });

        fs.unlinkSync(fileName);
    }
};