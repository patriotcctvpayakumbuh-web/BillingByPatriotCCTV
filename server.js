const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

app.post('/api/adb', (req, res) => {
    const { ip, action } = req.body;
    if (!ip) return res.status(400).json({ success: false, message: 'IP Address diperlukan' });

    let adbCommand = '';
    if (action === 'wake') {
        // Mulai: Wakeup TV & tutup total aplikasi Aerial Views (`com.neilturner.aerialviews`)
        adbCommand = `adb connect ${ip} && adb -s ${ip} shell input keyevent KEYCODE_WAKEUP && adb -s ${ip} shell am force-stop com.neilturner.aerialviews`;
    } else if (action === 'sleep') {
        // Selesai: Buka Aerial Views, tunggu 2 detik, lalu tekan arah bawah 3 kali & tekan OK (Test Screensaver)
        adbCommand = `adb connect ${ip} && adb -s ${ip} shell monkey -p com.neilturner.aerialviews -c android.intent.category.LAUNCHER 1 && sleep 2 && adb -s ${ip} shell input keyevent KEYCODE_DPAD_DOWN && adb -s ${ip} shell input keyevent KEYCODE_DPAD_DOWN && adb -s ${ip} shell input keyevent KEYCODE_DPAD_DOWN && adb -s ${ip} shell input keyevent KEYCODE_ENTER`;
    } else {
        return res.status(400).json({ success: false, message: 'Aksi tidak dikenal' });
    }

    exec(adbCommand, (error, stdout, stderr) => {
        if (error) {
            return res.json({ success: false, message: error.message });
        }
        if (stdout.includes('failed') || stdout.includes('cannot connect')) {
            return res.json({ success: false, message: 'Gagal terhubung ke IP TV via ADB' });
        }
        res.json({ success: true, output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server Billing Patriot Oke berjalan di http://localhost:${PORT}`);
});
