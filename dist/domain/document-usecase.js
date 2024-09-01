"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUsecase = void 0;
const document_1 = require("../database/entities/document");
const user_1 = require("../database/entities/user");
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
class DocumentUsecase {
    constructor(db, oAuth2Client) {
        this.db = db;
        this.oAuth2Client = oAuth2Client;
        // Initialiser le service Google Drive
        this.drive = googleapis_1.google.drive({ version: 'v3', auth: oAuth2Client });
    }
    // Créer et uploader un document sur Google Drive
    uploadDocument(req, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const documentRepo = this.db.getRepository(document_1.Document);
            const { title, description, type } = req.body;
            const file = req.file;
            // Valider que le fichier est fourni
            if (!file) {
                throw new Error('No file provided');
            }
            // Trouver l'utilisateur associé
            const user = yield userRepo.findOne({ where: { id: userId } });
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
                body: stream_1.Readable.from(file.buffer),
            };
            const { data } = yield this.drive.files.create({
                requestBody: fileMetadata,
                media,
                fields: 'id, webViewLink, webContentLink',
            });
            if (!data.id) {
                throw new Error('File upload to Google Drive failed');
            }
            // Étape 2 : Définir les permissions pour rendre le fichier public
            yield this.setFilePermissions(data.id);
            // Étape 3 : Créer une nouvelle entrée dans la base de données
            const newDocument = documentRepo.create({
                title: title || file.originalname, // Si aucun titre fourni, utiliser le nom du fichier
                description: description || "No description provided",
                type: file.mimetype,
                fileId: data.id, // Stocker l'ID du fichier Google Drive
                user,
                createdAt: new Date(),
            });
            // Sauvegarder les métadonnées dans la base de données
            return yield documentRepo.save(newDocument);
        });
    }
    // Définir les permissions pour rendre le fichier accessible par quiconque avec le lien
    setFilePermissions(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.drive.permissions.create({
                    fileId: fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
                console.log(`Permissions updated for file ${fileId}`);
            }
            catch (error) {
                console.error('Failed to update file permissions:', error);
                throw new Error('Failed to update file permissions');
            }
        });
    }
    // Liste des documents
    listDocuments() {
        return __awaiter(this, void 0, void 0, function* () {
            const documentRepo = this.db.getRepository(document_1.Document);
            return yield documentRepo.find({ relations: ['user'] });
        });
    }
    // Obtenir un document par ID
    getDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentRepo = this.db.getRepository(document_1.Document);
            return yield documentRepo.findOne({ where: { id }, relations: ['user'] });
        });
    }
    // Obtenir les liens d'un fichier depuis Google Drive
    getFileLinks(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.drive.files.get({
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
        });
    }
    // Mettre à jour un document
    updateDocument(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentRepo = this.db.getRepository(document_1.Document);
            // Trouver le document
            let documentFound = yield documentRepo.findOne({ where: { id } });
            if (!documentFound)
                return null;
            // Mettre à jour les champs du document
            if (params.title)
                documentFound.title = params.title;
            if (params.description)
                documentFound.description = params.description;
            if (params.type)
                documentFound.type = params.type;
            // Sauvegarder les modifications
            return yield documentRepo.save(documentFound);
        });
    }
    // Supprimer un document
    deleteDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentRepo = this.db.getRepository(document_1.Document);
            const documentFound = yield documentRepo.findOne({ where: { id } });
            if (!documentFound)
                return "Document not found";
            // Supprimer le fichier de Google Drive
            try {
                yield this.drive.files.delete({ fileId: documentFound.fileId });
            }
            catch (error) {
                console.error('Failed to delete file on Google Drive:', error);
            }
            // Supprimer le document de la base de données
            yield documentRepo.remove(documentFound);
            return documentFound;
        });
    }
}
exports.DocumentUsecase = DocumentUsecase;
