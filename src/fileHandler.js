const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

async function selectBmpFile(mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, {
        filters: [{ name: 'BMP Files', extensions: ['bmp'] }],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths[0]) {
        const filePath = result.filePaths[0];
        try {
            const bmpData = fs.readFileSync(filePath);
            const base64Image = bmpData.toString('base64');
            return { filePath, image: `data:image/bmp;base64,${base64Image}` };
        } catch (error) {
            console.error('Error reading BMP file:', error);
            return { success: false, message: 'Failed to read BMP file.' };
        }
    }
    return null;
}

function readBmpFile(filePath) {
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        console.error(`Error reading BMP file at ${filePath}:`, error);
        throw new Error('Failed to read BMP file.');
    }
}

async function saveBmpFile(mainWindow, bmpBuffer) {
    const saveResult = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'BMP Files', extensions: ['bmp'] }]
    });

    if (!saveResult.canceled && saveResult.filePath) {
        fs.writeFileSync(saveResult.filePath, bmpBuffer);
        const base64Image = bmpBuffer.toString('base64');
        return { success: true, image: `data:image/bmp;base64,${base64Image}` };
    }
    return { success: false, message: 'Save operation canceled.' };
}

module.exports = {
    selectBmpFile,
    readBmpFile,
    saveBmpFile
};
