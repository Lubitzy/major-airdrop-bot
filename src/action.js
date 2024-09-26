const cron = require('cron');
const {
    getBalance,
    getDailyLogin,
    clearHoldCoin,
    clearRoulette,
    clearSwipeCoin,
    clearPuzzleDurov,
    getIdUser
} = require('./api');

// Setup cron job untuk klaim login harian
async function setupCronJobDailyLogin(token) {
    // Jalankan getDailyLogin sebelum cron job dimulai
    try {
        await getDailyLogin(token);
        console.log('🌾 Daily login reward claimed!'.green.bold);
    } catch (error) {
        console.error('Error during initial daily login:', error.message);
    }

    const job = new cron.CronJob('0 */12 * * *', async () => {
        try {
            await getDailyLogin(token);
            console.log('🌾 Daily login reward claimed!'.green.bold);
        } catch (error) {
            console.error('Error in Daily Login Cron Job:', error.message);
        }
    });
    job.start();
    console.log('⏰ Cron job daily login set up to run every 12 hours.'.bold);
}

// Setup cron job untuk bermain game dan klaim hadiah
async function setupCronJobPlayGames(token) {
    // Jalankan klaim hadiah game sebelum cron job dimulai
    try {
        await clearPuzzleDurov(token);
        await clearHoldCoin(token);
        await clearRoulette(token);
        await clearSwipeCoin(token);
        console.log('🌾 Play games reward claimed!'.green.bold);
    } catch (error) {
        console.error('Error during initial play games claim:', error.message);
    }

    const job = new cron.CronJob('0 */8 * * *', async () => {
        try {
            await clearPuzzleDurov(token);
            await clearHoldCoin(token);
            await clearRoulette(token);
            await clearSwipeCoin(token);
            console.log('🌾 Play games reward claimed!'.green.bold);
        } catch (error) {
            console.error('Error in Play Games Cron Job:', error.message);
        }
    });
    job.start();
    console.log('⏰ Cron job play games set up to run every 8 hours.'.bold);
}

// Setup cron job untuk pengecekan saldo secara acak (1-8 jam)
async function setupBalanceCheckJob(token) {
    // Jalankan pengecekan saldo sebelum cron job dimulai
    const idUser = await getIdUser(token)
    try {
        const balance = await getBalance(token, idUser);
        console.log(`🌾 Initial farming balance: ${balance} MAJOR`.green.bold);
    } catch (error) {
        console.error('Error during initial balance check:', error.message);
    }

    const randomHour = Math.floor(Math.random() * 8) + 1;
    const cronPattern = `0 */${randomHour} * * *`;

    const job = new cron.CronJob(cronPattern, async () => {
        try {
            const balance = await getBalance(token, idUser);
            console.log(`🌾 Updated farming balance: ${balance} MAJOR`.green.bold);
        } catch (error) {
            console.error('Error in Balance Check Job:', error.message);
        }
    });

    job.start();
    console.log(`⏰ Balance check job set up to run every ${randomHour} hours.`.bold);
}

module.exports = {
    setupCronJobDailyLogin,
    setupCronJobPlayGames,
    setupBalanceCheckJob
};
