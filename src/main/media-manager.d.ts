import { MediaFile } from './database';
export declare class MediaManager {
    private database;
    private uploadPath;
    constructor();
    initialize(): Promise<void>;
    uploadFile(filePath: string): Promise<MediaFile>;
    getFiles(): Promise<MediaFile[]>;
    deleteFile(fileId: string): Promise<void>;
    private getFileCategory;
    private extractMetadata;
    private generateTags;
}
