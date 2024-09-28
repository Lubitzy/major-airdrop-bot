require('dotenv').config()
const axios = require('axios')

const BASE_URL = 'https://major.bot/api/'

async function getToken(sessionKey) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}auth/tg/`,
            method: 'POST',
            data: { init_data: sessionKey }
        })
        return `Bearer ${data.access_token}`
    } catch (error) {
        console.log(`Error fetching token : ${error.message}`)
    }
}

async function getIdUser(token) {
    const response = await axios({
        url: `${BASE_URL}user-visits/streak/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.user_id
}

async function getIdSquad(token, idUser) {
    const response = await axios({
        url: `${BASE_URL}users/${idUser}/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.squad_id
}

async function getUsername(token, idUser) {
    const response = await axios({
        url: `${BASE_URL}users/${idUser}/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.username
}

async function getBalance(token, idUser) {
    const response = await axios({
        url: `${BASE_URL}users/${idUser}/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.rating
}

async function getPosition(token, idUser) {
    const response = await axios({
        url: `${BASE_URL}users/top/position/${idUser}/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.position
}

async function getTribe(token, idSquad) {
    const response = await axios({
        url: `${BASE_URL}squads/${idSquad}`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data
}

async function getTribePosition(token, idSquad) {
    const response = await axios({
        url: `${BASE_URL}squads/top/position/${idSquad}/`,
        method: 'GET',
        headers: { Authorization: token }
    })
    return response.data.position
}

async function tasksDaily(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}tasks/?is_daily=true`,
            method: 'GET',
            headers: { Authorization: token }
        })
        const tasks = data.map(task => ({
            id: task.id,
            title: task.title
        }))
        return tasks
    } catch (error) {
        console.error('Error fetching daily tasks:', error.message)
    }
}

async function nonDailyTasks(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}tasks/?is_daily=false`,
            method: 'GET',
            headers: { Authorization: token }
        })
        const tasks = data.map(task => ({
            id: task.id,
            title: task.title
        }))
        return tasks
    } catch (error) {
        console.error('Error fetching non-daily tasks:', error.message)
    }
}

async function clearTasks(token, task_id, title) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}tasks/`,
            method: 'POST',
            headers: { Authorization: token },
            data: { task_id }
        });
        if (data.is_completed === true) {
            console.log(`✅ Task "${title}" successfully claimed!`.green)
        } else {
            console.log(`❌ Task "${title}" error: Task is not completed. Please complete manually.`)
        }
        return data;
    } catch (error) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.detail === 'Task is already completed'
        ) {
            console.log(`✅ Start task "${title}" failed, because the task is already completed.`)
        } else {
            console.error('Error occurred while claiming task:', error.message)
        }
    }
}

async function getDailyLogin(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}user-visits/visit/`,
            method: 'POST',
            headers: { Authorization: token }
        })

        if (data.is_increased === false) {
            console.log('🚨 Daily login claim failed because you already claimed this day')
        } else {
            console.log('✅ Daily login claim successful!'.green)
        }

        return data
    } catch (error) {
        if (error.response && error.response.data && error.response.data.is_increased === false) {
            console.log('🚨 Daily login claim failed because you already claimed this day')
        } else {
            console.error(`🚨 Error occurred during daily claim: ${error.message}`)
        }
    }
}

async function getPuzzleDurov() {
    const { data } = await axios({
        url: 'https://raw.githubusercontent.com/dancayairdrop/blum/main/durov.json',
        method: 'GET'
    })
    return data.tasks
}

async function getPuzzleDurov() {
    try {
        const { data } = await axios({
            url: 'https://raw.githubusercontent.com/dancayairdrop/blum/main/durov.json',
            method: 'GET'
        })
        const puzzle = data.tasks[0]
        return [puzzle.choice_1, puzzle.choice_2, puzzle.choice_3, puzzle.choice_4]
    } catch (error) {
        console.error('Error fetching Durov puzzle:', error.message)
    }
}

async function clearPuzzleDurov(token) {
    try {
        const puzzle = await getPuzzleDurov();
        if (!puzzle || puzzle.length < 4) {
            throw new Error('Puzzle does not have enough choices.')
        }
        const { data } = await axios({
            url: `${BASE_URL}durov/`,
            method: 'POST',
            headers: { Authorization: token },
            data: {
                choice_1: puzzle[0],
                choice_2: puzzle[1],
                choice_3: puzzle[2],
                choice_4: puzzle[3]
            }
        })
        if (data.success === true) {
            console.log('✅ Daily puzzle durov claim successful! Your reward: 5000'.green)
        } else {
            console.log('✅ Daily puzzle durov claim successful! Your reward: 5000'.green)
        }
    } catch (error) {
        if (error.response && error.response.data && error.response.data.detail && error.response.data.detail.need_invites === 5) {
            console.log('🚨 Daily puzzle durov claim failed because you already claimed this day')
        } else {
            console.error('Error occurred:', error.message)
        }
    }
}

async function clearSwipeCoin(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}swipe_coin/`,
            method: 'POST',
            headers: { Authorization: token },
            data: { coins: 3000 }
        })

        if (data.success === true) {
            console.log('✅ Daily swipe coin claim successful!, you reward 3000'.green)
        }
        return data

    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('🚨 Daily swipe coin claim failed because you already claimed this day')
        } else {
            console.error('Error occurred:', error.message);
        }
        return error.response ? error.response.data : { message: error.message }
    }
}

async function clearRoulette(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}roulette/`,
            method: 'POST',
            headers: { Authorization: token },
        })
        console.log(`✅ Daily spin claim successful!, your reward ${data.rating_award}`.green)
        return data

    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('🚨 Daily spin claim failed because you already claimed this day')
        } else {
            console.error('Error occurred:', error.message)
        }
    }
}

async function clearHoldCoin(token) {
    try {
        const { data } = await axios({
            url: `${BASE_URL}bonuses/coins/`,
            method: 'POST',
            headers: { Authorization: token },
            data: { coins: 915 }
        })
        if (data.success === true) {
            console.log('✅ Daily hold coin claim successful!, your reward 915'.green)
        }
        return data

    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('🚨 Daily hold coin claim failed because you already claimed this day')
        } else {
            console.error('Error occurred:', error.message);
        }
    }
}

module.exports = {
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
}