require('dotenv').config();
require('colors');
const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');

const { delay } = require('./src/delay');
const {
    displayHeader,
    askUserChoice,
    askDefaultChoice
} = require('./src/ui');
const {
    getToken,
    getIdUser,
    getIdSquad,
    getUsername,
    getBalance,
    getPosition,
    getTribe,
    getTribePosition,
    tasksDaily,
    nonDailyTasks,
    clearTasks,
    getDailyLogin,
    clearHoldCoin,
    clearRoulette,
    clearSwipeCoin,
    getPuzzleDurov,
    clearPuzzleDurov
} = require('./src/api');
const {
    setupCronJobDailyLogin,
    setupCronJobPlayGames,
    setupBalanceCheckJob,
} = require('./src/action');

const TOKEN_FILE_PATH = path.join(__dirname, 'tokenAccess.txt');

const getTokenAndSave = async () => {
    const token = await getToken();
    fs.writeFileSync(TOKEN_FILE_PATH, token);
    console.log('✅ New token has been saved\n');
    return token;
};

const completeTasksDaily = async (token, tasks) => {
    for (const task of tasks) {
        await clearTasks(token, task.id, task.title);
        await delay(3000);
    }
};

const completeTasksNonDaily = async (token, tasks) => {
    for (const task of tasks) {
        await clearTasks(token, task.id, task.title);
        await delay(3000);
    }
};

const userChoice = async (token) => {
    try {
        while (true) {
            const firstChoise = readlineSync.question(askUserChoice());
            if (firstChoise === '1') {
                while (true) {
                    const choiseDefaultFlow = readlineSync.question(askDefaultChoice())
                    if (choiseDefaultFlow === '1') {
                        console.log('🌾 Claiming daily login...')
                        await getDailyLogin(token)
                        break
                    }
                    else if (choiseDefaultFlow === '2') {
                        const puzzleDurov = await getPuzzleDurov()
                        console.log('🎮 Auto playing game and claiming reward...'.yellow)
                        await clearPuzzleDurov(token, puzzleDurov)
                        await clearHoldCoin(token)
                        await clearRoulette(token)
                        await clearSwipeCoin(token)
                        break
                    }
                    else if (choiseDefaultFlow === '3') {
                        const dailyTask = await tasksDaily(token)
                        const nonDailyTask = await nonDailyTasks(token)
                        console.log('✅ Auto completing tasks daily...'.yellow)
                        await completeTasksDaily(token, dailyTask)
                        console.log('✅ Auto completing tasks Non daily...'.yellow)
                        await completeTasksNonDaily(token, nonDailyTask)
                        break;
                    }
                    else if (choiseDefaultFlow === '0') {
                        console.log('🔙 Returning to main menu...')
                        break
                    } else {
                        console.log('Invalid choice, please try again.')
                    }
                }
            } else if (firstChoise === '2') {
                setupCronJobDailyLogin(token);
                setupCronJobPlayGames(token);
                setupBalanceCheckJob(token);
                console.log('Cron jobs are running. Application will not exit.');
                // Menghentikan loop dan menjaga cron jobs tetap berjalan
                break;
            } else if (firstChoise === '0') {
                console.log('Exiting the script. Goodbye!');
                process.exit();
            }
        }
    } catch (error) {
        console.log(error);
    }
};
const main = async () => {
    displayHeader();

    const token = await getTokenAndSave();

    const id_user = await getIdUser(token);
    const id_squad = await getIdSquad(token, id_user);
    const username = await getUsername(token, id_user);
    const squad = await getTribe(token, id_squad);
    const balance = await getBalance(token, id_user);
    const position = await getPosition(token, id_user);
    const positionSquad = await getTribePosition(token, id_squad);

    console.log(`👋 Hello, ${username}!`.green);
    console.log(`💰 Your current MAJOR balance is: ${balance}`.green);
    console.log(`🏆 Your position in MAJOR: ${position}`.green);
    console.log('');
    console.log('🏰 Your tribe details:');
    if (squad) {
        console.log(`   - Name: ${squad.name}`);
        console.log(`   - Members: ${squad.members_count}`);
        console.log(`   - Earn Balance: ${squad.rating}`);
        console.log(`   - Position Squad: Top Global ${positionSquad}`);
        console.log('');
    } else {
        console.error('🚨 Tribe not found!'.red);
    }

    userChoice(token);
};

main();