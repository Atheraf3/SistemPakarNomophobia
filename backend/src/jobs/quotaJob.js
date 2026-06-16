const cron = require('node-cron');
const User = require('../models/User');

const startQuotaJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Menjalankan job penambahan kuota harian.');
        try {
            const result = await User.updateMany(
                { role: 'user', quota: { $lt: 3 } },
                { $inc: { quota: 1 } }
            );
            
            console.log(`[CRON] Selesai. Kuota ditambahkan (+1) untuk ${result.modifiedCount} user.`);
        } catch (error) {
            console.error('[CRON] Error saat menjalankan job kuota:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });

    console.log('[CRON] Job penambahan kuota harian telah diaktifkan.');
};

module.exports = startQuotaJob;
