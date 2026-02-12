
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Process attendance image: Resize and convert to WebP
 * @param {Buffer} buffer - Image buffer
 * @param {string} filename - Output filename (without extension)
 * @returns {Promise<string>} - Relative path to saved image
 */
export const processAttendanceImage = async (buffer, filename) => {
    try {
        const uploadDir = path.join(process.cwd(), 'public', 'upload', 'attendance');
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        const outputFilename = `${filename}.webp`;
        const outputPath = path.join(uploadDir, outputFilename);

        await sharp(buffer)
            .resize(800, 800, { // Max dimensions, keep aspect ratio
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toFile(outputPath);

        return `/upload/attendance/${outputFilename}`;
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Gagal memproses gambar');
    }
};
