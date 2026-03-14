import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ 
        pushedContacts: [], 
        exportedContacts: [] 
    }, null, 2));
}

export const db = {
    _write(data) {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    },

    read() {
        try {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (e) {
            return { pushedContacts: [], exportedContacts: [] };
        }
    },
    
    addContact(jid) {
        if (!jid) return;
        const data = this.read();
        if (!data.pushedContacts.includes(jid)) {
            data.pushedContacts.push(jid);
            this._write(data);
        }
    },

    updateLidToNumber(lid, realJid) {
        const data = this.read();
        const index = data.pushedContacts.indexOf(lid);
        if (index !== -1 && lid !== realJid) {
            data.pushedContacts[index] = realJid;
            this._write(data);
            console.log(`\x1b[32m[DB UPDATE] LID ${lid} -> ${realJid}\x1b[0m`);
            return true;
        }
        return false;
    }
};