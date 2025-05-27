const fs = require('fs');

let userData = {};

function loadUserData() {
    try {
        if (fs.existsSync('users.json')) {
            userData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function saveUserData() {
    try {
        fs.writeFileSync('users.json', JSON.stringify(userData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

function getUserData() {
    return userData;
}

function updateUserData(username, data) {
    if (username && userData[username]) {
        Object.assign(userData[username], data);
        saveUserData();
    }
}

module.exports = {
    loadUserData,
    saveUserData,
    getUserData,
    updateUserData
};