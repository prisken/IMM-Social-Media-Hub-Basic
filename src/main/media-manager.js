import * as fs from 'fs';
import * as path from 'path';
import { AppDatabase } from './database';
export class MediaManager {
    constructor() {
        this.database = new AppDatabase();
        this.uploadPath = path.join(__dirname, '../../app/media/uploads');
    }
    async initialize() {
        // Ensure upload directories exist
        const directories = [
            path.join(this.uploadPath, 'images'),
            path.join(this.uploadPath, 'videos'),
            path.join(this.uploadPath, 'documents'),
            path.join(this.uploadPath, 'audio')
        ];
        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }
    async uploadFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }
        const stats = fs.statSync(filePath);
        const originalName = path.basename(filePath);
        const extension = path.extname(filePath).toLowerCase();
        const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
        // Determine category and target directory
        const { category, targetDir } = this.getFileCategory(extension);
        const targetPath = path.join(targetDir, filename);
        // Copy file to target directory
        fs.copyFileSync(filePath, targetPath);
        // Extract metadata
        const metadata = await this.extractMetadata(targetPath, extension);
        // Generate tags
        const tags = this.generateTags(originalName, extension, metadata);
        const mediaFile = {
            filename,
            originalName,
            filepath: targetPath,
            filetype: extension,
            filesize: stats.size,
            dimensions: metadata.dimensions,
            duration: metadata.duration,
            uploadDate: new Date().toISOString(),
            tags,
            category,
            usedCount: 0,
            metadata
        };
        const id = await this.database.addMediaFile(mediaFile);
        return { ...mediaFile, id };
    }
    async getFiles() {
        return await this.database.getMediaFiles();
    }
    async deleteFile(fileId) {
        const files = await this.database.getMediaFiles();
        const file = files.find(f => f.id === fileId);
        if (file && fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
        }
        await this.database.deleteMediaFile(fileId);
    }
    getFileCategory(extension) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'];
        const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
        const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md'];
        if (imageExtensions.includes(extension)) {
            return {
                category: 'images',
                targetDir: path.join(this.uploadPath, 'images')
            };
        }
        else if (videoExtensions.includes(extension)) {
            return {
                category: 'videos',
                targetDir: path.join(this.uploadPath, 'videos')
            };
        }
        else if (audioExtensions.includes(extension)) {
            return {
                category: 'audio',
                targetDir: path.join(this.uploadPath, 'audio')
            };
        }
        else if (documentExtensions.includes(extension)) {
            return {
                category: 'documents',
                targetDir: path.join(this.uploadPath, 'documents')
            };
        }
        else {
            return {
                category: 'other',
                targetDir: path.join(this.uploadPath, 'documents')
            };
        }
    }
    async extractMetadata(filePath, extension) {
        const metadata = {};
        try {
            // Basic file info
            const stats = fs.statSync(filePath);
            metadata.size = stats.size;
            metadata.created = stats.birthtime;
            metadata.modified = stats.mtime;
            // Image metadata (basic)
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
                // For now, we'll use a simple approach
                // In a real implementation, you'd use libraries like 'sharp' or 'jimp'
                metadata.type = 'image';
                metadata.dimensions = 'Unknown'; // Would be extracted with image processing library
            }
            // Video metadata (basic)
            if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
                metadata.type = 'video';
                metadata.duration = 0; // Would be extracted with ffmpeg
            }
            // Audio metadata (basic)
            if (['.mp3', '.wav', '.m4a'].includes(extension)) {
                metadata.type = 'audio';
                metadata.duration = 0; // Would be extracted with audio processing library
            }
            // Document metadata (basic)
            if (['.pdf', '.doc', '.docx', '.txt'].includes(extension)) {
                metadata.type = 'document';
                metadata.pages = 0; // Would be extracted with document processing library
            }
        }
        catch (error) {
            console.error('Error extracting metadata:', error);
        }
        return metadata;
    }
    generateTags(filename, extension, metadata) {
        const tags = [];
        // Add file type tag
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
            tags.push('image', 'photo');
        }
        else if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) {
            tags.push('video', 'media');
        }
        else if (['.mp3', '.wav', '.m4a'].includes(extension)) {
            tags.push('audio', 'sound');
        }
        else if (['.pdf', '.doc', '.docx', '.txt'].includes(extension)) {
            tags.push('document', 'text');
        }
        // Add filename-based tags (remove extension and split by common separators)
        const nameWithoutExt = filename.replace(extension, '');
        const words = nameWithoutExt
            .split(/[-_\s]+/)
            .filter(word => word.length > 2)
            .map(word => word.toLowerCase());
        tags.push(...words);
        // Add common marketing tags based on filename
        const marketingKeywords = [
            'marketing', 'brand', 'logo', 'product', 'service', 'campaign',
            'social', 'media', 'content', 'design', 'creative', 'business'
        ];
        const filenameLower = filename.toLowerCase();
        marketingKeywords.forEach(keyword => {
            if (filenameLower.includes(keyword)) {
                tags.push(keyword);
            }
        });
        return [...new Set(tags)]; // Remove duplicates
    }
}
