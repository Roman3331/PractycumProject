function generateBmpImage(bmpData, mode, colorScheme) {
    if (bmpData.readUInt16LE(0) !== 0x4D42) {
        throw new Error('Invalid BMP file format. Not a BMP.');
    }
    if (bmpData.readUInt16LE(28) !== 24 || bmpData.readUInt32LE(30) !== 0) {
        throw new Error('Only 24-bit uncompressed BMP files are supported for generation.');
    }

    const width = bmpData.readUInt32LE(18);
    const height = bmpData.readUInt32LE(22);

    const newBmp = Buffer.alloc(bmpData.length);
    bmpData.copy(newBmp, 0, 0, 54);

    let pixelIndex = 54;
    const rowSize = width * 3;
    const padding = (4 - (rowSize % 4)) % 4;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r, g, b;

            switch (mode) {
                case 'gradient':
                    r = (x / width) * 255;
                    g = (y / height) * 255;
                    b = ((x + y) / (width + height)) * 255;
                    break;
                case 'waves':
                    r = Math.sin(x / 50) * 127 + 128;
                    g = Math.sin(y / 50) * 127 + 128;
                    b = Math.sin((x + y) / 50) * 127 + 128;
                    break;
                case 'noise':
                    r = Math.random() * 255;
                    g = Math.random() * 255;
                    b = Math.random() * 255;
                    break;
                case 'spiral':
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    const angle = Math.atan2(y - centerY, x - centerX);
                    r = (Math.sin(distance / 20 + angle) * 127 + 128);
                    g = (Math.cos(distance / 20 + angle) * 127 + 128);
                    b = (Math.sin(distance / 20 - angle) * 127 + 128);
                    break;
                case 'stripes':
                    const stripeWidth = 20;
                    const stripeValue = Math.floor(y / stripeWidth) % 2;
                    r = stripeValue * 255;
                    g = (1 - stripeValue) * 255;
                    b = (Math.floor(y / stripeWidth) % 3 === 2) ? 255 : 0;
                    break;
                case 'mosaic':
                    const blockSize = 20;
                    const blockX = Math.floor(x / blockSize);
                    const blockY = Math.floor(y / blockSize);

                    const seed = (blockX * 1000 + blockY) * 12345;
                    r = (Math.sin(seed * 0.1) * 127 + 128);
                    g = (Math.cos(seed * 0.1 + 1) * 127 + 128);
                    b = (Math.sin(seed * 0.1 + 2) * 127 + 128);
                    break;
                default:
                    const originalPixelOffset = 54 + (y * width + x) * 3;
                    b = bmpData[originalPixelOffset];
                    g = bmpData[originalPixelOffset + 1];
                    r = bmpData[originalPixelOffset + 2];
                    break;
            }

            switch (colorScheme) {
                case 'rgb':
                    break;
                case 'grayscale':
                    const avg = (r + g + b) / 3;
                    r = g = b = avg;
                    break;
                case 'inverted':
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                    break;
            }

            newBmp[pixelIndex++] = Math.floor(b);
            newBmp[pixelIndex++] = Math.floor(g);
            newBmp[pixelIndex++] = Math.floor(r);
        }
        for (let p = 0; p < padding; p++) {
            newBmp[pixelIndex++] = 0;
        }
    }
    return newBmp;
}

module.exports = {
    generateBmpImage
};
