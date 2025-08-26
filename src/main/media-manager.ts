import * as fs from 'fs';
import * as path from 'path';
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
import { AppDatabase, MediaFile } from './database';

// Set ffmpeg path properly
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}
if (ffprobeStatic) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

export class MediaManager {
  private database: AppDatabase;
  private uploadPath: string;
  private thumbnailsPath: string;
  private variantsPath: string;

  constructor() {
    this.database = new AppDatabase();
    this.uploadPath = path.join(process.cwd(), 'app/media/uploads');
    this.thumbnailsPath = path.join(process.cwd(), 'app/media/thumbnails');
    this.variantsPath = path.join(process.cwd(), 'app/media/variants');
  }

  async initialize(): Promise<void> {
    // Initialize database first
    await this.database.initialize();
    
    // Ensure upload directories exist
    const directories = [
      path.join(this.uploadPath, 'images'),
      path.join(this.uploadPath, 'videos'),
      path.join(this.uploadPath, 'documents'),
      path.join(this.uploadPath, 'audio'),
      this.thumbnailsPath,
      this.variantsPath
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async uploadFile(filePath: string): Promise<MediaFile> {
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

    // Extract metadata and generate thumbnail
    const metadata = await this.extractMetadata(targetPath, extension);
    const thumbnailPath = await this.generateThumbnail(targetPath, extension, filename);
    
    // Generate tags
    const tags = this.generateTags(originalName, extension, metadata);

    const mediaFile: Omit<MediaFile, 'id'> = {
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
      metadata: {
        ...metadata,
        thumbnailPath
      }
    };

    const id = await this.database.addMediaFile(mediaFile);
    
    return { ...mediaFile, id };
  }

  // Add comprehensive variant generation
  async generateVariants(fileId: string, selectedVariants: string[] = []): Promise<any> {
    try {
      const file = await this.database.getMediaFileById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const filePath = path.join(this.uploadPath, file.category, file.filename);
      const ext = path.extname(file.filename).toLowerCase();
      const results: any = {};

      // Determine file type and generate selected variants
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
        if (selectedVariants.includes('social_media') || selectedVariants.length === 0) {
          results.social_media = await this.generateImageVariants(filePath, 'social_media');
        }
        if (selectedVariants.includes('print') || selectedVariants.length === 0) {
          results.print = await this.generateImageVariants(filePath, 'print');
        }
        if (selectedVariants.includes('web') || selectedVariants.length === 0) {
          results.web = await this.generateImageVariants(filePath, 'web');
        }
        if (selectedVariants.includes('formats') || selectedVariants.length === 0) {
          results.formats = await this.generateImageVariants(filePath, 'formats');
        }
      } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(ext)) {
        if (selectedVariants.includes('social_media') || selectedVariants.length === 0) {
          results.social_media = await this.generateVideoVariants(filePath, 'social_media');
        }
        if (selectedVariants.includes('web') || selectedVariants.length === 0) {
          results.web = await this.generateVideoVariants(filePath, 'web');
        }
        if (selectedVariants.includes('formats') || selectedVariants.length === 0) {
          results.formats = await this.generateVideoVariants(filePath, 'formats');
        }
      } else if (['.mp3', '.wav', '.aac', '.ogg', '.flac'].includes(ext)) {
        if (selectedVariants.includes('podcast') || selectedVariants.length === 0) {
          results.podcast = await this.generateAudioVariants(filePath, 'podcast');
        }
        if (selectedVariants.includes('web') || selectedVariants.length === 0) {
          results.web = await this.generateAudioVariants(filePath, 'web');
        }
        if (selectedVariants.includes('formats') || selectedVariants.length === 0) {
          results.formats = await this.generateAudioVariants(filePath, 'formats');
        }
      }

      return results;
    } catch (error) {
      console.error('Error generating variants:', error);
      throw error;
    }
  }

  private async generateImageVariants(filePath: string, filename: string): Promise<any> {
    const variants: any = {};
    const baseName = path.parse(filename).name;

    try {
      // Social Media Variants
      variants.social = {
        instagram: await this.createImageVariant(filePath, baseName, 'instagram', { width: 1080, height: 1080, format: 'jpg', quality: 90 }),
        facebook: await this.createImageVariant(filePath, baseName, 'facebook', { width: 1200, height: 630, format: 'jpg', quality: 90 }),
        twitter: await this.createImageVariant(filePath, baseName, 'twitter', { width: 1200, height: 675, format: 'jpg', quality: 90 }),
        linkedin: await this.createImageVariant(filePath, baseName, 'linkedin', { width: 1200, height: 627, format: 'jpg', quality: 90 }),
        youtube: await this.createImageVariant(filePath, baseName, 'youtube', { width: 1280, height: 720, format: 'jpg', quality: 90 })
      };

      // Print Variants
      variants.print = {
        a4: await this.createImageVariant(filePath, baseName, 'a4', { width: 2480, height: 3508, format: 'png', quality: 100 }),
        business_card: await this.createImageVariant(filePath, baseName, 'business_card', { width: 1050, height: 600, format: 'png', quality: 100 }),
        poster: await this.createImageVariant(filePath, baseName, 'poster', { width: 2480, height: 3508, format: 'png', quality: 100 })
      };

      // Web Variants
      variants.web = {
        hero: await this.createImageVariant(filePath, baseName, 'hero', { width: 1920, height: 1080, format: 'webp', quality: 85 }),
        thumbnail: await this.createImageVariant(filePath, baseName, 'thumbnail', { width: 400, height: 300, format: 'webp', quality: 80 }),
        icon: await this.createImageVariant(filePath, baseName, 'icon', { width: 512, height: 512, format: 'png', quality: 100 })
      };

      // Format Variants
      variants.formats = {
        jpg: await this.createImageVariant(filePath, baseName, 'jpg', { format: 'jpg', quality: 90 }),
        png: await this.createImageVariant(filePath, baseName, 'png', { format: 'png', quality: 100 }),
        webp: await this.createImageVariant(filePath, baseName, 'webp', { format: 'webp', quality: 85 }),
        avif: await this.createImageVariant(filePath, baseName, 'avif', { format: 'avif', quality: 80 })
      };

    } catch (error) {
      console.error('Error generating image variants:', error);
    }

    return variants;
  }

  private async createImageVariant(filePath: string, baseName: string, variantName: string, options: any): Promise<string | null> {
    try {
      const variantFilename = `${baseName}_${variantName}.${options.format || 'jpg'}`;
      const variantPath = path.join(this.variantsPath, variantFilename);

      let sharpInstance = sharp(filePath);

      // Apply resize if dimensions specified
      if (options.width && options.height) {
        sharpInstance = sharpInstance.resize(options.width, options.height, { 
          fit: 'cover', 
          position: 'center' 
        });
      }

      // Apply format and quality
      switch (options.format) {
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: options.quality || 90 });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: options.quality || 100 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: options.quality || 80 });
          break;
      }

      await sharpInstance.toFile(variantPath);
      return variantPath;

    } catch (error) {
      console.error(`Error creating ${variantName} variant:`, error);
      return null;
    }
  }

  private async generateVideoVariants(filePath: string, filename: string): Promise<any> {
    const variants: any = {};
    const baseName = path.parse(filename).name;

    try {
      // Social Media Video Variants
      variants.social = {
        instagram: await this.createVideoVariant(filePath, baseName, 'instagram', { width: 1080, height: 1080, format: 'mp4' }),
        facebook: await this.createVideoVariant(filePath, baseName, 'facebook', { width: 1280, height: 720, format: 'mp4' }),
        twitter: await this.createVideoVariant(filePath, baseName, 'twitter', { width: 1280, height: 720, format: 'mp4' }),
        youtube: await this.createVideoVariant(filePath, baseName, 'youtube', { width: 1920, height: 1080, format: 'mp4' })
      };

      // Web Video Variants
      variants.web = {
        webm: await this.createVideoVariant(filePath, baseName, 'webm', { format: 'webm' }),
        mp4_web: await this.createVideoVariant(filePath, baseName, 'mp4_web', { format: 'mp4', bitrate: '1000k' })
      };

    } catch (error) {
      console.error('Error generating video variants:', error);
    }

    return variants;
  }

  private async createVideoVariant(filePath: string, baseName: string, variantName: string, options: any): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        const variantFilename = `${baseName}_${variantName}.${options.format || 'mp4'}`;
        const variantPath = path.join(this.variantsPath, variantFilename);

        let command = ffmpeg(filePath);

        // Apply resize if dimensions specified
        if (options.width && options.height) {
          command = command.size(`${options.width}x${options.height}`);
        }

        // Apply format and quality settings
        if (options.format === 'webm') {
          command = command
            .videoCodec('libvpx-vp9')
            .audioCodec('libopus')
            .outputOptions(['-crf 30', '-b:v 0']);
        } else {
          command = command
            .videoCodec('libx264')
            .audioCodec('aac');
          
          if (options.bitrate) {
            command = command.videoBitrate(options.bitrate);
          }
        }

        command
          .output(variantPath)
          .on('end', () => resolve(variantPath))
          .on('error', (err) => {
            console.error(`Error creating ${variantName} video variant:`, err);
            resolve(null);
          })
          .run();

      } catch (error) {
        console.error(`Error setting up ${variantName} video variant:`, error);
        resolve(null);
      }
    });
  }

  private async generateAudioVariants(filePath: string, filename: string): Promise<any> {
    const variants: any = {};
    const baseName = path.parse(filename).name;

    try {
      // Audio format variants
      variants.formats = {
        mp3: await this.createAudioVariant(filePath, baseName, 'mp3', { format: 'mp3', bitrate: '192k' }),
        aac: await this.createAudioVariant(filePath, baseName, 'aac', { format: 'aac', bitrate: '128k' }),
        ogg: await this.createAudioVariant(filePath, baseName, 'ogg', { format: 'ogg', bitrate: '128k' })
      };

      // Quality variants
      variants.quality = {
        high: await this.createAudioVariant(filePath, baseName, 'high', { format: 'mp3', bitrate: '320k' }),
        medium: await this.createAudioVariant(filePath, baseName, 'medium', { format: 'mp3', bitrate: '192k' }),
        low: await this.createAudioVariant(filePath, baseName, 'low', { format: 'mp3', bitrate: '128k' })
      };

    } catch (error) {
      console.error('Error generating audio variants:', error);
    }

    return variants;
  }

  private async createAudioVariant(filePath: string, baseName: string, variantName: string, options: any): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        const variantFilename = `${baseName}_${variantName}.${options.format || 'mp3'}`;
        const variantPath = path.join(this.variantsPath, variantFilename);

        let command = ffmpeg(filePath);

        // Apply format and quality settings
        switch (options.format) {
          case 'mp3':
            command = command
              .audioCodec('libmp3lame')
              .audioBitrate(options.bitrate || '192k');
            break;
          case 'aac':
            command = command
              .audioCodec('aac')
              .audioBitrate(options.bitrate || '128k');
            break;
          case 'ogg':
            command = command
              .audioCodec('libvorbis')
              .audioBitrate(options.bitrate || '128k');
            break;
        }

        command
          .output(variantPath)
          .on('end', () => resolve(variantPath))
          .on('error', (err) => {
            console.error(`Error creating ${variantName} audio variant:`, err);
            resolve(null);
          })
          .run();

      } catch (error) {
        console.error(`Error setting up ${variantName} audio variant:`, error);
        resolve(null);
      }
    });
  }

  async getFiles(): Promise<MediaFile[]> {
    return await this.database.getMediaFiles();
  }

  async deleteFile(fileId: string): Promise<void> {
    const files = await this.database.getMediaFiles();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
      // Delete main file
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      
      // Delete thumbnail
      if (file.metadata?.thumbnailPath && fs.existsSync(file.metadata.thumbnailPath)) {
        fs.unlinkSync(file.metadata.thumbnailPath);
      }
    }
    
    await this.database.deleteMediaFile(fileId);
  }

  async searchFiles(query: string, category?: string): Promise<MediaFile[]> {
    const files = await this.database.getMediaFiles();
    
    return files.filter(file => {
      const matchesCategory = !category || category === 'all' || file.category === category;
      const matchesQuery = !query || 
        file.originalName.toLowerCase().includes(query.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      return matchesCategory && matchesQuery;
    });
  }

  private getFileCategory(extension: string): { category: string; targetDir: string } {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md', '.ppt', '.pptx', '.xls', '.xlsx'];

    if (imageExtensions.includes(extension)) {
      return {
        category: 'images',
        targetDir: path.join(this.uploadPath, 'images')
      };
    } else if (videoExtensions.includes(extension)) {
      return {
        category: 'videos',
        targetDir: path.join(this.uploadPath, 'videos')
      };
    } else if (audioExtensions.includes(extension)) {
      return {
        category: 'audio',
        targetDir: path.join(this.uploadPath, 'audio')
      };
    } else if (documentExtensions.includes(extension)) {
      return {
        category: 'documents',
        targetDir: path.join(this.uploadPath, 'documents')
      };
    } else {
      return {
        category: 'other',
        targetDir: path.join(this.uploadPath, 'documents')
      };
    }
  }

  private async extractMetadata(filePath: string, extension: string): Promise<any> {
    const metadata: any = {};

    try {
      // Basic file info
      const stats = fs.statSync(filePath);
      metadata.size = stats.size;
      metadata.created = stats.birthtime;
      metadata.modified = stats.mtime;

      // Image metadata using Sharp
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(extension)) {
        try {
          const image = sharp(filePath);
          const imageInfo = await image.metadata();
          
          metadata.type = 'image';
          metadata.dimensions = `${imageInfo.width}x${imageInfo.height}`;
          metadata.format = imageInfo.format;
          metadata.space = imageInfo.space;
          metadata.channels = imageInfo.channels;
          metadata.depth = imageInfo.depth;
          metadata.density = imageInfo.density;
          metadata.orientation = imageInfo.orientation;
          
          // Extract EXIF data if available
          if (imageInfo.exif) {
            metadata.exif = imageInfo.exif;
          }
        } catch (error) {
          console.error('Error extracting image metadata:', error);
          metadata.type = 'image';
          metadata.dimensions = 'Unknown';
        }
      }

      // Video metadata using FFmpeg
      if (['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'].includes(extension)) {
        metadata.type = 'video';
        await new Promise<void>((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
              console.error('Error extracting video metadata:', err);
              resolve();
              return;
            }
            
            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
            const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
            
            if (videoStream) {
              metadata.dimensions = `${videoStream.width}x${videoStream.height}`;
              metadata.videoCodec = videoStream.codec_name;
              metadata.fps = videoStream.r_frame_rate;
            }
            
            if (audioStream) {
              metadata.audioCodec = audioStream.codec_name;
              metadata.sampleRate = audioStream.sample_rate;
              metadata.channels = audioStream.channels;
            }
            
            metadata.duration = metadata.format.duration;
            metadata.bitrate = metadata.format.bit_rate;
            metadata.format = metadata.format.format_name;
            
            resolve();
          });
        });
      }

      // Audio metadata using FFmpeg
      if (['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'].includes(extension)) {
        metadata.type = 'audio';
        await new Promise<void>((resolve, reject) => {
          ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
              console.error('Error extracting audio metadata:', err);
              resolve();
              return;
            }
            
            const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
            
            if (audioStream) {
              metadata.audioCodec = audioStream.codec_name;
              metadata.sampleRate = audioStream.sample_rate;
              metadata.channels = audioStream.channels;
              metadata.bitrate = audioStream.bit_rate;
            }
            
            metadata.duration = metadata.format.duration;
            metadata.format = metadata.format.format_name;
            
            resolve();
          });
        });
      }

      // Document metadata (basic)
      if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md', '.ppt', '.pptx', '.xls', '.xlsx'].includes(extension)) {
        metadata.type = 'document';
        metadata.pages = 0; // Would be extracted with document processing library
      }

    } catch (error) {
      console.error('Error extracting metadata:', error);
    }

    return metadata;
  }

  private async generateThumbnail(filePath: string, extension: string, filename: string): Promise<string | null> {
    try {
      const thumbnailName = `thumb_${path.parse(filename).name}.jpg`;
      const thumbnailPath = path.join(this.thumbnailsPath, thumbnailName);

      // Generate thumbnail for images
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(extension)) {
        await sharp(filePath)
          .resize(200, 200, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        return thumbnailPath;
      }

      // Generate thumbnail for videos
      if (['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'].includes(extension)) {
        return new Promise((resolve, reject) => {
          ffmpeg(filePath)
            .screenshots({
              timestamps: ['50%'],
              filename: thumbnailName,
              folder: this.thumbnailsPath,
              size: '200x200'
            })
            .on('end', () => resolve(thumbnailPath))
            .on('error', (err) => {
              console.error('Error generating video thumbnail:', err);
              resolve(null);
            });
        });
      }

      // For other file types, return null (no thumbnail)
      return null;

    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  private generateTags(filename: string, extension: string, metadata: any): string[] {
    const tags: string[] = [];

    // Add file type tag
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'].includes(extension)) {
      tags.push('image', 'photo');
    } else if (['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'].includes(extension)) {
      tags.push('video', 'media');
    } else if (['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma'].includes(extension)) {
      tags.push('audio', 'sound');
    } else if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md', '.ppt', '.pptx', '.xls', '.xlsx'].includes(extension)) {
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
      'social', 'media', 'content', 'design', 'creative', 'business',
      'advertisement', 'promotion', 'announcement', 'update', 'news'
    ];

    const filenameLower = filename.toLowerCase();
    marketingKeywords.forEach(keyword => {
      if (filenameLower.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Add metadata-based tags
    if (metadata.dimensions) {
      tags.push(metadata.dimensions);
    }
    if (metadata.format) {
      tags.push(metadata.format);
    }

    return Array.from(new Set(tags)); // Remove duplicates
  }
} 