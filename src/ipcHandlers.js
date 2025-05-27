const { ipcMain } = require('electron');
const { hashPassword, getCurrentUser, setCurrentUser, clearCurrentUser } = require('./auth');
const { loadUserData, saveUserData, getUserData, updateUserData } = require('./userData');
const { selectBmpFile, readBmpFile, saveBmpFile } = require('./fileHandler');
const { generateBmpImage } = require('./bmpGenerator');
const { hideMessageInBmp, extractMessageFromBmp } = require('./steganography');

let mainWindowRef;
let currentFilePath = null;

function setMainWindow(window) {
    mainWindowRef = window;
}

function registerIpcHandlers() {
    ipcMain.handle('login', async (event, { username, password }) => {
        const hashedPassword = hashPassword(password);
        const userData = getUserData();

        if (!userData[username]) {
            userData[username] = {
                password: hashedPassword,
                recentFiles: [],
                recentModes: [],
                sentMessages: [],
                receivedMessages: [],
                lastSettings: null
            };
            saveUserData();
            setCurrentUser(username);
            return { success: true, settings: null };
        } else if (userData[username].password === hashedPassword) {
            setCurrentUser(username);
            return { success: true, settings: userData[username].lastSettings };
        }
        return { success: false, message: 'Invalid credentials' };
    });

    ipcMain.handle('logout', async () => {
        clearCurrentUser();
        currentFilePath = null;
        return { success: true };
    });

    ipcMain.handle('select-file', async () => {
        const result = await selectBmpFile(mainWindowRef);
        if (result && result.filePath) {
            currentFilePath = result.filePath;
            const currentUser = getCurrentUser();
            if (currentUser) {
                const userData = getUserData();
                if (!userData[currentUser].recentFiles.includes(currentFilePath)) {
                    userData[currentUser].recentFiles.unshift(currentFilePath);
                    if (userData[currentUser].recentFiles.length > 3) {
                        userData[currentUser].recentFiles.pop();
                    }
                    saveUserData();
                }
            }
            return result;
        }
        return null;
    });

    ipcMain.handle('create-bmp', async (event, { mode, colorScheme }) => {
        if (!currentFilePath) {
            return { success: false, message: 'No file selected. Please select a BMP file first.' };
        }

        try {
            const bmpData = readBmpFile(currentFilePath);
            const newBmp = generateBmpImage(bmpData, mode, colorScheme);
            const saveResult = await saveBmpFile(mainWindowRef, newBmp);

            if (saveResult.success) {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    const userData = getUserData();
                    userData[currentUser].recentModes.unshift({ mode, colorScheme });
                    if (userData[currentUser].recentModes.length > 3) {
                        userData[currentUser].recentModes.pop();
                    }
                    userData[currentUser].lastSettings = { mode, colorScheme };
                    saveUserData();
                }
            }
            return saveResult;
        } catch (error) {
            console.error('Error creating BMP:', error);
            return { success: false, message: error.message || 'Failed to create BMP file.' };
        }
    });

    ipcMain.handle('hide-message', async (event, { message }) => {
        if (!currentFilePath) {
            return { success: false, message: 'No file selected. Please select a BMP file first.' };
        }

        try {
            const bmpData = readBmpFile(currentFilePath);
            const newBmp = hideMessageInBmp(bmpData, message);
            const saveResult = await saveBmpFile(mainWindowRef, newBmp);

            if (saveResult.success) {
                const currentUser = getCurrentUser();
                if (currentUser) {
                    const userData = getUserData();
                    userData[currentUser].sentMessages.unshift(message);
                    if (userData[currentUser].sentMessages.length > 3) {
                        userData[currentUser].sentMessages.pop();
                    }
                    saveUserData();
                }
            }
            return saveResult;
        } catch (error) {
            console.error('Error hiding message:', error);
            return { success: false, message: error.message || 'Failed to hide message.' };
        }
    });

    ipcMain.handle('extract-message', async () => {
        if (!currentFilePath) {
            return { success: false, message: 'No file selected. Please select a BMP file first.' };
        }

        try {
            const bmpData = readBmpFile(currentFilePath);
            const message = extractMessageFromBmp(bmpData);

            const currentUser = getCurrentUser();
            if (currentUser && message.trim()) {
                const userData = getUserData();
                userData[currentUser].receivedMessages.unshift(message);
                if (userData[currentUser].receivedMessages.length > 3) {
                    userData[currentUser].receivedMessages.pop();
                }
                saveUserData();
            }

            return { success: true, message };
        } catch (error) {
            console.error('Error extracting message:', error);
            return { success: false, message: error.message || 'Failed to extract message.' };
        }
    });

    ipcMain.handle('get-user-data', async () => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const userData = getUserData();
            return {
                recentFiles: userData[currentUser].recentFiles,
                recentModes: userData[currentUser].recentModes,
                sentMessages: userData[currentUser].sentMessages,
                receivedMessages: userData[currentUser].receivedMessages
            };
        }
        return null;
    });

    ipcMain.handle('show-instructions', async () => {
        return {
            instructions: '1. Login to access all features\n2. Select BMP file to work with\n3. Choose generation mode and color scheme\n4. Create new BMP or hide/extract messages\n5. Save results using system dialogs\n6. View the processed image in the preview section'
        };
    });

    ipcMain.handle('show-about-program', async () => {
        return {
            about: 'BMP Editor Application\nVersion 1.0.0\nSupports BMP image creation, steganography, and image preview'
        };
    });

    ipcMain.handle('show-authors', async () => {
        return {
            authors: 'Developed by xAI Team'
        };
    });
}

module.exports = {
    registerIpcHandlers,
    setMainWindow
};