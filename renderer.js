if (typeof window.api === 'undefined') {
    console.error('window.api is not defined. Ensure preload.js is correctly configured.');
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const result = await window.api.login({ username, password });

    if (result.success) {
        document.getElementById('loginSection').classList.remove('flex');
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('mainSection').classList.remove('hidden');
        document.getElementById('mainSection').classList.add('flex');
        if (result.settings) {
            document.getElementById('mode').value = result.settings.mode;
            document.getElementById('colorScheme').value = result.settings.colorScheme;
        }
        updateRecentData();
    } else {
        alert('Login failed: ' + result.message);
    }
}

async function logout() {
    await window.api.logout();
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('loginSection').classList.add('flex');
    document.getElementById('mainSection').classList.remove('flex');
    document.getElementById('mainSection').classList.add('hidden');
    document.getElementById('bmpPreview').src = '';
    document.getElementById('bmpPreview').style.display = 'none';
}

async function selectFile() {
    const result = await window.api.selectFile();
    if (result && result.filePath) {
        document.getElementById('currentFile').textContent = result.filePath;
        document.getElementById('bmpPreview').src = result.image;
        document.getElementById('bmpPreview').style.display = 'block';
        updateRecentData();
    } else if (result && result.message) {
        alert('Error: ' + result.message);
    }
}

async function createBMP() {
    const mode = document.getElementById('mode').value;
    const colorScheme = document.getElementById('colorScheme').value;
    const result = await window.api.createBMP({ mode, colorScheme });
    alert(result.success ? 'BMP created successfully' : 'Error: ' + result.message);
    if (result.success && result.image) {
        document.getElementById('bmpPreview').src = result.image;
        document.getElementById('bmpPreview').style.display = 'block';
    }
    updateRecentData();
}

async function hideMessage() {
    const message = document.getElementById('message').value;
    console.log('Message to hide:', message);
    const result = await window.api.hideMessage({ message });
    alert(result.success ? 'Message hidden successfully' : 'Error: ' + result.message);
    if (result.success && result.image) {
        document.getElementById('bmpPreview').src = result.image;
        document.getElementById('bmpPreview').style.display = 'block';
    }
    updateRecentData();
}

async function extractMessage() {
    const result = await window.api.extractMessage();
    if (result.success) {
        console.log('Extracted message:', result.message);
        alert('Extracted message: ' + result.message);
        updateRecentData();
    } else {
        console.error('Error:', result.message);
        alert('Error extracting message: ' + result.message);
    }
}

async function showInstructions() {
    const info = await window.api.showInstructions();
    alert(info.instructions);
}

async function showAboutProgram() {
    const info = await window.api.showAboutProgram();
    alert(info.about);
}

async function showAuthors() {
    const info = await window.api.showAuthors();
    alert(info.authors);
}

async function updateRecentData() {
    const data = await window.api.getUserData();
    if (data) {
        document.getElementById('recentFiles').textContent = data.recentFiles.join(', ');

        const recentModesContainer = document.getElementById('recentModes');
        recentModesContainer.innerHTML = '';

        data.recentModes.forEach(({ mode, colorScheme }, index) => {
            const button = document.createElement('button');
            button.textContent = `${mode}/${colorScheme}`;
            button.className = 'px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700';
            button.onclick = () => selectRecentMode(mode, colorScheme);
            recentModesContainer.appendChild(button);
        });

        document.getElementById('sentMessages').textContent = data.sentMessages.join(', ');
        document.getElementById('receivedMessages').textContent = data.receivedMessages.join(', ');
    }
}

function selectRecentMode(mode, colorScheme) {
    document.getElementById('mode').value = mode;
    document.getElementById('colorScheme').value = colorScheme;
}

window.login = login;
window.logout = logout;
window.selectFile = selectFile;
window.createBMP = createBMP;
window.hideMessage = hideMessage;
window.extractMessage = extractMessage;
window.showInstructions = showInstructions;
window.showAboutProgram = showAboutProgram;
window.showAuthors = showAuthors;
window.updateRecentData = updateRecentData;
window.selectRecentMode = selectRecentMode;