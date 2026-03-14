// plugins/push-kontak.js
import { db } from '../database.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
    command: ['.push', '.jpm'], // Trigger perintah
    run: async (sock, msg, args, config) => {
        const from = msg.key.remoteJid;

        //LOGIKA CEK OWNER (SUPPORT LID & PHONE) ---
        const sender = msg.key.participant || msg.key.remoteJid || "";
        const isOwner = sender.includes(config.ownerNumber) || sender.includes(config.ownerLid);

        if (!isOwner) {
            return sock.sendMessage(from, { 
                text: `❌ Fitur ini hanya untuk Owner!\n\nID Kamu: ${sender}` 
            }, { quoted: msg });
        }

        // 3. Validasi argumen pesan
        if (!args) {
            return sock.sendMessage(from, { text: "⚠️ *Gunakan:* .push {Halo|Hai} kak, salken ya." });
        }

        // 4. Kirim pesan tunggu (Loading)
        await sock.sendMessage(from, { text: config.msgWait || "🚀 Sedang memproses push kontak ke seluruh grup..." });

        try {
            // 5. Ambil semua grup yang bot ikuti
            const groups = await sock.groupFetchAllParticipating();
            const allGroups = Object.values(groups);

            let totalPushed = 0;

            for (let group of allGroups) {
                console.log(`📂 Memproses grup: ${group.subject}`);
                
                for (let participant of group.participants) {
                    // 1. Ambil ID pengirim (bisa nomor biasa atau LID)
                    const jid = participant.id;

                    // 2. Filter: Lewati jika itu adalah bot sendiri
                    const isMe = jid.includes(sock.user.id.split(':')[0]);
                    if (isMe) continue;

                    // 3. Filter Database: Cek apakah ID ini sudah pernah di-push?
                    // Kita cek JID asli dan juga JID yang dibersihkan (tanpa :1 dsb)
                    const cleanJid = jid.split(':')[0] + (jid.includes('@') ? '' : '@s.whatsapp.net');
                    
                    if (!db.isPushed(jid) && !db.isPushed(cleanJid)) {
                        try {
                            // Proses Spintax
                            const finalMsg = args.replace(/{([^{}]+)}/g, (m, o) => {
                                const choices = o.split('|');
                                return choices[Math.floor(Math.random() * choices.length)];
                            });

                            // Kirim Pesan
                            await sock.sendMessage(jid, { text: finalMsg });
                            
                            // Simpan ke database
                            db.addContact(jid);
                            db.addContact(cleanJid); 
                            
                            totalPushed++;
                            console.log(`✅ Berhasil push ke: ${jid}`);

                            // Delay acak
                            const wait = Math.floor(Math.random() * (config.delay.max - config.delay.min)) + config.delay.min;
                            await delay(wait);
                        } catch (e) { 
                            console.log(`❌ Gagal kirim ke ${jid}:`, e.message); 
                        }
                    }
                }
            }

            // 7. Selesai
            await sock.sendMessage(from, { 
                text: `${config.msgDone || "✅ Push Selesai!"}\n\nTotal nomor baru yang dichat: ${totalPushed}` 
            });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Terjadi kesalahan saat mengambil data grup." });
        }
    }
};