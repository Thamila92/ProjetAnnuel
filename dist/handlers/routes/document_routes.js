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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGoogleDriveRoutes = void 0;
const multer_1 = __importDefault(require("multer"));
const googleapis_1 = require("googleapis");
const database_1 = require("../../database/database");
const document_usecase_1 = require("../../domain/document-usecase");
const initGoogleDriveRoutes = (app) => {
    // Configuration de OAuth2Client pour Google Drive
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
    // Mettre à jour le token si nécessaire (refresh_token)
    oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });
    // Créer une instance du DocumentUsecase en lui passant le DataSource et le OAuth2Client
    const documentUsecase = new document_usecase_1.DocumentUsecase(database_1.AppDataSource, oAuth2Client);
    // Configuration de Multer pour gérer les uploads de fichiers
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({ storage }).single('file');
    // Route pour uploader un document
    app.post('/document/upload', (req, res) => {
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).json({ message: 'Multer error', error: err.message });
            }
            try {
                // Appel au use case pour uploader un document
                const userId = req.body.userId || undefined; // Remplacer par l'ID de l'utilisateur réel (ex: via token ou session)
                const newDocument = yield documentUsecase.uploadDocument(req, userId);
                res.status(201).json({ message: 'File uploaded successfully', document: newDocument });
            }
            catch (error) {
                console.error('Error uploading document:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }));
    });
    // Route pour lister tous les documents
    app.get('/documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Appel au use case pour lister les documents
            const documents = yield documentUsecase.listDocuments();
            res.status(200).json(documents);
        }
        catch (error) {
            console.error('Error listing documents:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour obtenir les liens d'un document spécifique
    app.get('/document/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Appel au use case pour obtenir les informations sur le document
            const documentId = parseInt(req.params.id);
            const document = yield documentUsecase.getDocument(documentId);
            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }
            // Appel au use case pour obtenir les liens Google Drive
            const links = yield documentUsecase.getFileLinks(document.fileId);
            res.status(200).json({ document, links });
        }
        catch (error) {
            console.error('Error getting document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour supprimer un document
    app.delete('/document/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Appel au use case pour supprimer un document
            const documentId = parseInt(req.params.id);
            const deletedDocument = yield documentUsecase.deleteDocument(documentId);
            if (typeof deletedDocument === 'string') {
                return res.status(404).json({ message: deletedDocument });
            }
            res.status(200).json({ message: 'Document deleted successfully', document: deletedDocument });
        }
        catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/files/:id/remove-from-folder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const fileId = parseInt(req.params.id);
        try {
            const updatedDocument = yield documentUsecase.removeFileFromFolder(fileId);
            if (!updatedDocument) {
                return res.status(404).json({ message: 'Document not found' });
            }
            res.status(200).json({ message: 'File removed from folder successfully', document: updatedDocument });
        }
        catch (error) {
            console.error('Error removing file from folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour mettre à jour un document (PATCH)
    app.patch('/document/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const documentId = parseInt(req.params.id);
            const updateParams = req.body;
            // Appel au use case pour mettre à jour un document
            const updatedDocument = yield documentUsecase.updateDocument(documentId, updateParams);
            if (!updatedDocument) {
                return res.status(404).json({ message: 'Document not found' });
            }
            res.status(200).json({ message: 'Document updated successfully', document: updatedDocument });
        }
        catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
};
exports.initGoogleDriveRoutes = initGoogleDriveRoutes;
