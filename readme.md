### 📝 Deskripsi & Informasi Bot

| Informasi | Detail |
| :--- | :--- |
| **Nama Bot** | **Blast Bot** |
| **Versi** | 1.0.0 |
| **Bahasa Pemrograman** | Node.js (JavaScript) |
| **Library Utama** | [Whiskeysockets/Baileys](https://github.com/WhiskeySockets/Baileys) |
| **Sistem Operasi** | Linux (Ubuntu/WSL), Windows, Android (Termux) |

---

# 🤖 Viel Bot - WhatsApp Marketing Automation

Bot WhatsApp berbasis **Baileys (ESM)** yang dirancang khusus untuk kebutuhan marketing massal dengan keamanan tingkat tinggi.

## 🚀 Fitur Utama

- ✅ **Smart Push Contacts**: Kirim pesan ke anggota grup secara otomatis.
- 🔄 **LID Auto-Converter**: Otomatis mengubah ID samaran (@lid) menjadi nomor asli (@s.whatsapp.net) saat target membalas.
- 📊 **Daily Limit System**: Batasan push harian otomatis untuk mencegah banned.
- 📂 **Filtered VCF Export**: Ekspor database hanya untuk nomor telepon asli yang valid.
- 💻 **Terminal Access**: Jalankan perintah shell server langsung via chat dengan prefix `$`.
- 🛠 **Auto-Repair Database**: Sistem database mandiri yang aman dari file corrupt.
- 📜 **Dynamic Menu**: List fitur otomatis berdasarkan isi folder plugins.

## 🛡️ Keamanan (Anti-Banned)

Bot ini dilengkapi dengan beberapa lapisan keamanan:
1. **Adaptive Delay**: Jeda pengiriman pesan yang diacak untuk mensimulasikan aktivitas manusia.
2. **Quota Management**: Berhenti otomatis saat mencapai batas harian yang dikonfigurasi di `config.js`.
3. **Multi-Owner Access**: Mendukung banyak ID owner (Nomor HP & LID) untuk kendali penuh.

## 🛠️ Instalasi

1. Clone repository:
   ```bash
   git clone [https://github.com/username/repository.git](https://github.com/username/repository.git)

2. Instal dependencies:
    ```bash
    npm install

3. Konfigurasi `config.js`:
Sesuaikan `owners`, `ownerNumber`, dan `delay`.

4. Jalankan Bot:
    ```Bash
    node index.js