function hideMessageInBmp(bmpData, message) {
    if (!message || typeof message !== 'string' || message.trim() === '') {
        throw new Error('Invalid or empty message.');
    }
    if (bmpData.readUInt16LE(0) !== 0x4D42) {
        throw new Error('Invalid BMP file format. Not a BMP.');
    }
    const biBitCount = bmpData.readUInt16LE(28);
    const biCompression = bmpData.readUInt32LE(30);

    if (biBitCount !== 24 || biCompression !== 0) {
        throw new Error('Only 24-bit uncompressed BMP files are supported for steganography.');
    }

    const newBmp = Buffer.from(bmpData);
    const width = bmpData.readUInt32LE(18);
    const height = bmpData.readUInt32LE(22);
    const pixelDataOffset = bmpData.readUInt32LE(10);

    const messageBytes = Buffer.from(message + '\0', 'utf8'); // Add null terminator
    const rowSize = width * 3;
    const padding = (4 - (rowSize % 4)) % 4;

    const totalPixelBytes = (rowSize + padding) * height;
    const actualUsableBytes = totalPixelBytes - (padding * height); // Exclude padding bytes from usable space

    const availableBits = actualUsableBytes * 8;
    const requiredBits = messageBytes.length * 8;

    if (requiredBits > availableBits) {
        throw new Error(
            `Message too long. Maximum ${Math.floor(availableBits / 8)} bytes allowed, but ${messageBytes.length} bytes needed. (Usable bytes: ${actualUsableBytes})`
        );
    }

    let bitIndex = 0;
    let currentBmpByteIndex = pixelDataOffset;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let color = 0; color < 3; color++) {
                if (bitIndex < requiredBits) {
                    const byteInMessage = Math.floor(bitIndex / 8);
                    const bitInByte = 7 - (bitIndex % 8); // Read from MSB
                    const bitValue = (messageBytes[byteInMessage] >> bitInByte) & 1;

                    newBmp[currentBmpByteIndex] = (newBmp[currentBmpByteIndex] & 0xFE) | bitValue;

                    bitIndex++;
                } else {
                    break;
                }
                currentBmpByteIndex++;
            }
            if (bitIndex >= requiredBits) break;
        }
        currentBmpByteIndex += padding;
        if (bitIndex >= requiredBits) break;
    }
    return newBmp;
}

function extractMessageFromBmp(bmpData) {
    if (bmpData.readUInt16LE(0) !== 0x4D42) {
        throw new Error('Invalid BMP file format. Not a BMP.');
    }
    const biBitCount = bmpData.readUInt16LE(28);
    const biCompression = bmpData.readUInt32LE(30);

    if (biBitCount !== 24 || biCompression !== 0) {
        throw new Error('Only 24-bit uncompressed BMP files are supported for steganography.');
    }

    const width = bmpData.readUInt32LE(18);
    const height = bmpData.readUInt32LE(22);
    const pixelDataOffset = bmpData.readUInt32LE(10);

    const rowSize = width * 3;
    const padding = (4 - (rowSize % 4)) % 4;

    const bits = [];
    let currentBmpByteIndex = pixelDataOffset;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let color = 0; color < 3; color++) {
                if (currentBmpByteIndex < bmpData.length) {
                    bits.push(bmpData[currentBmpByteIndex] & 1);
                } else {
                    break;
                }
                currentBmpByteIndex++;
            }
            if (currentBmpByteIndex >= bmpData.length) break;
        }
        currentBmpByteIndex += padding;
        if (currentBmpByteIndex >= bmpData.length) break;
    }

    const bytes = [];
    let currentByte = 0;
    let bitCount = 0;

    for (let i = 0; i < bits.length; i++) {
        currentByte = (currentByte << 1) | bits[i];
        bitCount++;

        if (bitCount === 8) {
            if (currentByte === 0) { // Null terminator found
                break;
            }
            bytes.push(currentByte);
            currentByte = 0;
            bitCount = 0;
        }
    }

    try {
        return Buffer.from(bytes).toString('utf8');
    } catch (e) {
        throw new Error('Failed to decode message: ' + e.message);
    }
}

module.exports = {
    hideMessageInBmp,
    extractMessageFromBmp
};