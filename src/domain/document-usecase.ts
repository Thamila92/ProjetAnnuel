import { DataSource } from "typeorm";
import { UserDocument } from "../database/entities/document";
import { User } from "../database/entities/user";
import GoogleDriveService from "../services/googleDriveService";
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
export interface ListDocumentFilter {
    limit: number;
    page: number;
}

export interface UpdateDocumentParams {
    title?: string;
    description?: string;
    type?: string;
    path?: string;
    userId?: number;
}

export interface CreateDocumentParams {
    title: string;
    description: string;
    type: string;
    fileId: string;
    path: string;
    userId: number;
}
export class DocumentUsecase {
    private readonly db: DataSource;
    private readonly googleDriveService: GoogleDriveService;

    constructor(db: DataSource, oAuth2Client: OAuth2Client) {
        this.db = db;
        this.googleDriveService = new GoogleDriveService(oAuth2Client);
    }

    async listDocuments(filter: ListDocumentFilter): Promise<{ documents: Document[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Document, 'document')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [documents, totalCount] = await query.getManyAndCount();
        return {
            documents,
            totalCount
        };
    }

    async createDocument(params: CreateDocumentParams): Promise<Document | string> {
        const userRepo = this.db.getRepository(User);
        const documentRepo = this.db.getRepository(Document);

        const userFound = await userRepo.findOne({ where: { id: params.userId } });
        if (!userFound) {
            return "User not found";
        }

        const newDocument = documentRepo.create({
            title: params.title,
            description: params.description,
            type: params.type,
            path: params.path,
            user: userFound
        });

        await documentRepo.save(newDocument);
        return newDocument;
    }

    async getDocument(id: number): Promise<Document | null> {
        const repo = this.db.getRepository(Document);
        const documentFound = await repo.findOne({ where: { id } });
        return documentFound || null;
    }

    async updateDocument(id: number, params: UpdateDocumentParams): Promise<Document | null> {
        const repo = this.db.getRepository(Document);
        const documentFound = await repo.findOne({ where: { id } });
        if (!documentFound) return null;

        if (params.title) documentFound.title = params.title;
        if (params.description) documentFound.description = params.description;
        if (params.type) documentFound.type = params.type;
        if (params.path) documentFound.fileId = params.path;
        if (params.path) documentFound.path = params.path;
        if (params.userId) {
            const userRepo = this.db.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: params.userId } });
            if (userFound) documentFound.user = userFound;
        }

        const updatedDocument = await repo.save(documentFound);
        return updatedDocument;
    }

    async deleteDocument(id: number): Promise<boolean | Document> {
        const repo = this.db.getRepository(Document);
        const documentFound = await repo.findOne({ where: { id } });
        if (!documentFound) return false;

        await repo.remove(documentFound);
        return documentFound;
    }

    async getDocumentsByUser(userId: number): Promise<Document[]> {
        const repo = this.db.getRepository(Document);
        return await repo.find({ where: { user: { id: userId } } });
    }

    async listGoogleDriveFiles() {
        return await this.googleDriveService.listFiles();
    }

    async getGoogleDriveFile(fileId: string) {
        return await this.googleDriveService.getFile(fileId);
    }

    async uploadFileToGoogleDrive(name: string, mimeType: string, body: Readable): Promise<string> {
        const file = await this.googleDriveService.uploadFile(name, mimeType, body);
        return file.id || '';
    }
    async createDocumentWithGoogleDrive(params: CreateDocumentParams, fileId: string): Promise<Document | string> {
        const userRepo = this.db.getRepository(User);
        const documentRepo = this.db.getRepository(Document);

        const userFound = await userRepo.findOne({ where: { id: params.userId } });
        if (!userFound) {
            return "User not found";
        }

        const newDocument = documentRepo.create({
            title: params.title,
            description: params.description,
            type: params.type,
            path: fileId,  
            user: userFound
        });

        await documentRepo.save(newDocument);
        return newDocument;
    }
}
