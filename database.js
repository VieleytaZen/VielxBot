// database.js
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

// --- 1. FUNGSI INISIALISASI STRUKTUR DEFAULT ---
const getInitialStructure = () => {
    const today = new Date().toISOString().split('T')[0];
    return { 
        pushedContacts: [], 
        exportedContacts: [], 
        history: { 
            lastPushDate: today, 
            todayCount: 0 
        } 
    };
};

// Cek dan buat file jika tidak ada atau korup saat booting
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(getInitialStructure(), null, 2));
} else {
    try {
        const checkData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        // Pastikan bagian history ada, jika tidak ada tambahkan tanpa hapus data lama
        if (!checkData.history) {
            checkData.history = getInitialStructure().history;
            fs.writeFileSync(DB_PATH, JSON.stringify(checkData, null, 2));
        }
    } catch (e) {
        // Jika file JSON rusak/salah format, buat baru
        fs.writeFileSync(DB_PATH, JSON.stringify(getInitialStructure(), null, 2));
    }
}

export const db = {
    // --- 2. FUNGSI INTERNAL ---
    _write(data) {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    },

    read() {
        try {
            return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (e) {
            return getInitialStructure();
        }
    },

    // --- 3. MANAJEMEN KONTAK ---
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
    },

    isPushed(jid) {
        return this.read().pushedContacts.includes(jid);
    },

    // --- 4. STATISTIK & LIMIT HARIAN ---
    _checkResetDay() {
        const data = this.read();
        const today = new Date().toISOString().split('T')[0];
        
        if (!data.history) {
            data.history = { lastPushDate: today, todayCount: 0 };
        }

        if (data.history.lastPushDate !== today) {
            data.history.lastPushDate = today;
            data.history.todayCount = 0;
            this._write(data);
        }
        return data;
    },

    incrementTodayCount() {
        const data = this._checkResetDay();
        data.history.todayCount += 1;
        this._write(data);
    },

    getTodayCount() {
        const data = this._checkResetDay();
        return data.history.todayCount;
    },

    // --- 5. FITUR RESET (OPSIONAL) ---
    resetPushed() {
        const newData = getInitialStructure();
        this._write(newData);
        return true;
    }
};