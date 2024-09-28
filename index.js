require('dotenv').config()
require('colors')
const readlineSync = require('readline-sync')
const fs = require('fs')
const path = require('path')
const Tabel = require('cli-table3')

const { delay } = require('./src/delay')
const {
    displayHeader,
    askUserChoice,
    askDefaultChoice
} = require('./src/ui')
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
} = require('./src/api')
const {
    setupCronJobDailyLogin,
    setupCronJobPlayGames,
    setupBalanceCheckJob,
} = require('./src/action')

const TOKEN_FILE_PATH = path.join(__dirname, 'tokenAccess.txt')

const getTokenAndSave = async (sessionKey) => {
    const token = await getToken(sessionKey)
    fs.writeFileSync(TOKEN_FILE_PATH, token)
    console.log('\n✅ New token has been saved\n')
    return token
}

async function selectAccount() {
    const sessionKeys = [
        process.env.SESSION_KEY_1,
        process.env.SESSION_KEY_2
    ]

    const table = new Tabel({
        head: ['No'.white.bold, 'Name'.white.bold, 'Position'.white.bold, 'Balance'.white.bold],
        colWidths: [5, 20, 20, 20]
    });

    const accounts = []

    for (let i = 0; i < sessionKeys.length; i++) {
        const token = await getToken(sessionKeys[i])
        const idUser = await getIdUser(token)
        const balance = await getBalance(token, idUser)
        const position = await getPosition(token, idUser)
        const username = await getUsername(token, idUser)
        const name = `${username}`

        accounts.push({ no: i + 1, name, position, balance })
        table.push([i + 1, name, position, balance])
    }

    console.log(table.toString())

    const choice = readlineSync.question('\nSelect account by number: ')
    const selectedAccount = accounts.find(acc => acc.no === parseInt(choice))

    if (selectedAccount) {
        console.log(`🎉 You selected: ${selectedAccount.name}`)
        return sessionKeys[selectedAccount.no - 1]
    } else {
        console.log('❌ Invalid choice.')
        return null;
    }
}

const completeTasksDaily = async (token, tasks) => {
    for (const task of tasks) {
        await clearTasks(token, task.id, task.title)
        await delay(3000)
    }
}

const completeTasksNonDaily = async (token, tasks) => {
    for (const task of tasks) {
        await clearTasks(token, task.id, task.title)
        await delay(3000)
    }
}

const userChoice = async (token) => {
    try {
        while (true) {
            const firstChoice = readlineSync.question(askUserChoice())
            if (firstChoice === '1') {
                while (true) {
                    const choiceDefaultFlow = readlineSync.question(askDefaultChoice())
                    if (choiceDefaultFlow === '1') {
                        console.log('🌾 Claiming daily login...')
                        await getDailyLogin(token)
                        break
                    }
                    else if (choiceDefaultFlow === '2') {
                        const puzzleDurov = await getPuzzleDurov()
                        console.log('🎮 Auto playing game and claiming reward...'.yellow)
                        await clearPuzzleDurov(token, puzzleDurov)
                        await clearHoldCoin(token)
                        await clearRoulette(token)
                        await clearSwipeCoin(token)
                        break
                    }
                    else if (choiceDefaultFlow === '3') {
                        const dailyTask = await tasksDaily(token)
                        const nonDailyTask = await nonDailyTasks(token)
                        console.log('✅ Auto completing daily tasks...'.yellow)
                        await completeTasksDaily(token, dailyTask)
                        console.log('✅ Auto completing non-daily tasks...'.yellow)
                        await completeTasksNonDaily(token, nonDailyTask)
                        break
                    }
                    else if (choiceDefaultFlow === '0') {
                        console.log('🔙 Returning to main menu...')
                        break
                    } else {
                        console.log('❌ Invalid choice, please try again.')
                    }
                }
            } else if (firstChoice === '2') {
                setupCronJobDailyLogin(token)
                setupCronJobPlayGames(token)
                setupBalanceCheckJob(token)
                console.log('⏰ Cron jobs are running. Application will not exit.')
                break
            } else if (firstChoice === '0') {
                console.log('👋 Exiting the script. Goodbye!')
                process.exit()
            }
        }
    } catch (error) {
        console.log('⚠️ An error occurred:', error.message)
    }
}

const main = async () => {
    displayHeader()

    const selectedSessionKey = await selectAccount()
    if (!selectedSessionKey) {
        console.log('❌ No session key found. Exiting.')
        return;
    }

    const token = await getTokenAndSave(selectedSessionKey);

    const id_user = await getIdUser(token)
    const id_squad = await getIdSquad(token, id_user)
    const username = await getUsername(token, id_user)
    const squad = await getTribe(token, id_squad)
    const balance = await getBalance(token, id_user)
    const position = await getPosition(token, id_user)
    const positionSquad = await getTribePosition(token, id_squad)

    console.log(`👋 Hello, ${username}!`.green)
    console.log(`💰 Your current MAJOR balance is: ${balance}`.green)
    console.log(`🏆 Your position in MAJOR: ${position}`.green)
    console.log('')
    console.log('🏰 Your tribe details:')
    if (squad) {
        console.log(`   - Name: ${squad.name}`)
        console.log(`   - Members: ${squad.members_count}`)
        console.log(`   - Earn Balance: ${squad.rating}`)
        console.log(`   - Position Squad: Top Global ${positionSquad}`)
        console.log('')
    } else {
        console.error('🚨 Tribe not found!'.red)
    }

    userChoice(token)
}

main()
