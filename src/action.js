const cron = require('cron')
const {
    getBalance,
    getDailyLogin,
    clearHoldCoin,
    clearRoulette,
    clearSwipeCoin,
    clearPuzzleDurov,
    getIdUser
} = require('./api')

async function setupCronJobDailyLogin(token) {
    try {
        await getDailyLogin(token)
        console.log('🌾 Daily login reward claimed!'.green.bold)
    } catch (error) {
        console.error('Error during initial daily login:', error.message)
    }

    const job = new cron.CronJob('0 */12 * * *', async () => {
        try {
            await getDailyLogin(token)
            console.log('🌾 Daily login reward claimed!'.green.bold)
        } catch (error) {
            console.error('Error in Daily Login Cron Job:', error.message)
        }
    });
    job.start()
    console.log('⏰ Cron job daily login set up to run every 12 hours.'.bold)
}

async function setupCronJobPlayGames(token) {
    try {
        await clearPuzzleDurov(token)
        await clearHoldCoin(token)
        await clearRoulette(token)
        await clearSwipeCoin(token)
        console.log('🌾 Play games reward claimed!'.green.bold)
    } catch (error) {
        console.error('Error during initial play games claim:', error.message)
    }

    const job = new cron.CronJob('0 */8 * * *', async () => {
        try {
            await clearPuzzleDurov(token)
            await clearHoldCoin(token)
            await clearRoulette(token)
            await clearSwipeCoin(token)
            console.log('🌾 Play games reward claimed!'.green.bold)
        } catch (error) {
            console.error('Error in Play Games Cron Job:', error.message)
        }
    });
    job.start();
    console.log('⏰ Cron job play games set up to run every 8 hours.'.bold)
}

async function setupBalanceCheckJob(token) {
    const idUser = await getIdUser(token)
    try {
        const balance = await getBalance(token, idUser)
        console.log(`🌾 Initial farming balance: ${balance} MAJOR`.green.bold)
    } catch (error) {
        console.error('Error during initial balance check:', error.message)
    }

    const randomHour = Math.floor(Math.random() * 8) + 1
    const cronPattern = `0 */${randomHour} * * *`

    const job = new cron.CronJob(cronPattern, async () => {
        try {
            const balance = await getBalance(token, idUser)
            console.log(`🌾 Updated farming balance: ${balance} MAJOR`.green.bold)
        } catch (error) {
            console.error('Error in Balance Check Job:', error.message)
        }
    })

    job.start();
    console.log(`⏰ Balance check job set up to run every ${randomHour} hours.`.bold)
}

module.exports = {
    setupCronJobDailyLogin,
    setupCronJobPlayGames,
    setupBalanceCheckJob
};
