const colors = require('colors');

function displayHeader() {
    console.clear();
    console.log('=========================================='.brightWhite);
    console.log('|          ✨ Major Airdrop Bot ✨       |'.brightWhite.bold);
    console.log('=========================================='.brightWhite);
    console.log('|            Created by Lubitzy          |'.brightWhite.bold);
    console.log('|       Telegram: https://t.me/lubiqt    |'.brightWhite.bold);
    console.log('=========================================='.brightWhite);
    console.log();
}

function askUserChoice() {
    return `
🤖 What would you like to do?
1. Default Flow (Manual Actions)
2. Automatic Flow (Run Cron Jobs)
0. Exit the Program

Please enter your choice: `;
}

function askDefaultChoice() {
    return `
🛠️  Default Flow Menu:
1. Auto Claim Daily Login
2. Auto Play Games and Claim Rewards
3. Auto Complete All Tasks
0. Go Back to Main Menu

Please enter your choice: `;
}

module.exports = {
    displayHeader,
    askUserChoice,
    askDefaultChoice,
};