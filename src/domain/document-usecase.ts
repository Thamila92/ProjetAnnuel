import { DataSource } from "typeorm";
import { Document } from "../database/entities/document";
import { v4 as uuidv4 } from 'uuid';
import { Request } from "express";
import { User } from "../database/entities/user";
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';

export interface UpdateDocumentParams {
    title?: string;
    description?: string;
    type?: string;
}

export class DocumentUsecase {
    private drive: drive_v3.Drive;

    constructor(private readonly db: DataSource, private readonly oAuth2Client: OAuth2Client) {
        // Initialiser le service Google Drive
        this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
    }

    // Créer et uploader un document sur Google Drive
    async uploadDocument(req: Request, userId: number): Promise<Document> {
        const userRepo = this.db.getRepository(User);
        const documentRepo = this.db.getRepository(Document);

        const { title, description, type } = req.body;
        const file = req.file;

        // Valider que le fichier est fourni
        if (!file) {
            throw new Error('No file provided');
        }

        // Trouver l'utilisateur associé
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        // Étape 1 : Upload du fichier vers Google Drive
        const fileMetadata = {
            name: file.originalname,
            mimeType: file.mimetype,
        };

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        const { data } = await this.drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: 'id, webViewLink, webContentLink',
        });

        if (!data.id) {
            throw new Error('File upload to Google Drive failed');
        }

        // Étape 2 : Définir les permissions pour rendre le fichier public
        await this.setFilePermissions(data.id);

        // Étape 3 : Créer une nouvelle entrée dans la base de données
        const newDocument = documentRepo.create({
            title: title || file.originalname,  // Si aucun titre fourni, utiliser le nom du fichier
            description: description || "No description provided",
            type: file.mimetype,
            fileId: data.id,  // Stocker l'ID du fichier Google Drive
            user,
            createdAt: new Date(),
        });

        // Sauvegarder les métadonnées dans la base de données
        return await documentRepo.save(newDocument);
    }

    // Définir les permissions pour rendre le fichier accessible par quiconque avec le lien
    private async setFilePermissions(fileId: string): Promise<void> {
        try {
            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            console.log(`Permissions updated for file ${fileId}`);
        } catch (error) {
            console.error('Failed to update file permissions:', error);
            throw new Error('Failed to update file permissions');
        }
    }

    // Liste des documents
    async listDocuments(): Promise<Document[]> {
        const documentRepo = this.db.getRepository(Document);
        return await documentRepo.find({ relations: ['user'] });
    }

    // Obtenir un document par ID
    async getDocument(id: number): Promise<Document | null> {
        const documentRepo = this.db.getRepository(Document);
        return await documentRepo.findOne({ where: { id }, relations: ['user'] });
    }

    // Obtenir les liens d'un fichier depuis Google Drive
    async getFileLinks(fileId: string): Promise<{ webViewLink: string; webContentLink: string; }> {
        const { data } = await this.drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });

        if (!data) {
            throw new Error('File not found on Google Drive');
        }

        return {
            webViewLink: data.webViewLink || '',
            webContentLink: data.webContentLink || '',
        };
    }

    // Mettre à jour un document
    async updateDocument(id: number, params: UpdateDocumentParams): Promise<Document | null> {
        const documentRepo = this.db.getRepository(Document);

        // Trouver le document
        let documentFound = await documentRepo.findOne({ where: { id } });
        if (!documentFound) return null;

        // Mettre à jour les champs du document
        if (params.title) documentFound.title = params.title;
        if (params.description) documentFound.description = params.description;
        if (params.type) documentFound.type = params.type;

        // Sauvegarder les modifications
        return await documentRepo.save(documentFound);
    }

    // Supprimer un document
    async deleteDocument(id: number): Promise<Document | string> {
        const documentRepo = this.db.getRepository(Document);
        const documentFound = await documentRepo.findOne({ where: { id } });

        if (!documentFound) return "Document not found";

        // Supprimer le fichier de Google Drive
        try {
            await this.drive.files.delete({ fileId: documentFound.fileId });
        } catch (error) {
            console.error('Failed to delete file on Google Drive:', error);
        }

        // Supprimer le document de la base de données
        await documentRepo.remove(documentFound);
        return documentFound;
    }


    async removeFileFromFolder(fileId: number): Promise<Document | null> {
        const documentRepo = this.db.getRepository(Document);
    
        // Trouver le document
        let document = await documentRepo.findOne({ where: { id: fileId } });
        if (!document) return null;
    
        // Retirer le document du dossier en mettant folderId à null
        document.folder.id = null;
    
        // Sauvegarder les modifications
        return await documentRepo.save(document);
    }
}
