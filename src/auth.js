const crypto = require('crypto');

let currentUser = null;

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function getCurrentUser() {
    return currentUser;
}

function setCurrentUser(username) {
    currentUser = username;
}

function clearCurrentUser() {
    currentUser = null;
}

module.exports = {
    hashPassword,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser
};
