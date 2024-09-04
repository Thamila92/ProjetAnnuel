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
exports.initFolderRoutes = void 0;
const database_1 = require("../../database/database");
const folder_usecase_1 = require("../../domain/folder-usecase");
// Initialiser les routes pour les dossiers
const initFolderRoutes = (app) => {
    const folderUsecase = new folder_usecase_1.FolderUsecase(database_1.AppDataSource);
    // Route pour créer un dossier
    app.post('/folder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name } = req.body;
        const userId = req.body.userId || undefined; // Remplacer par l'ID réel de l'utilisateur connecté
        try {
            const newFolder = yield folderUsecase.createFolder({ name, userId });
            res.status(201).json(newFolder);
        }
        catch (error) {
            console.error('Error creating folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour lister tous les dossiers d'un utilisateur
    app.get('/folders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = req.body.userId || undefined; // Remplacer par l'ID réel de l'utilisateur connecté
        try {
            const folders = yield folderUsecase.listFolders(userId);
            res.status(200).json(folders);
        }
        catch (error) {
            console.error('Error listing folders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour obtenir un dossier spécifique par ID
    app.get('/folder/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        try {
            const folder = yield folderUsecase.getFolder(folderId);
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json(folder);
        }
        catch (error) {
            console.error('Error fetching folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour mettre à jour un dossier
    app.patch('/folder/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        const { name } = req.body;
        try {
            const updatedFolder = yield folderUsecase.updateFolder(folderId, { name });
            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Folder updated successfully', folder: updatedFolder });
        }
        catch (error) {
            console.error('Error updating folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/folders/:id/move-to-parent/:parentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        const parentId = parseInt(req.params.parentId);
        try {
            const updatedFolder = yield folderUsecase.moveToParent(folderId, parentId);
            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Folder moved to new parent successfully', folder: updatedFolder });
        }
        catch (error) {
            console.error('Error moving folder to new parent:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    // Route pour supprimer un dossier et ses documents associés
    app.delete('/folder/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        try {
            const deletedFolder = yield folderUsecase.deleteFolder(folderId);
            if (!deletedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Folder and its documents deleted successfully', folder: deletedFolder });
        }
        catch (error) {
            console.error('Error deleting folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/folders/:id/add-file', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        const { fileId } = req.body;
        try {
            const updatedFolder = yield folderUsecase.addFileToFolder(folderId, fileId);
            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'File added to folder successfully', folder: updatedFolder });
        }
        catch (error) {
            console.error('Error adding file to folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/folders/:parentId/add-folder/:childId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const parentFolderId = parseInt(req.params.parentId);
        const childFolderId = parseInt(req.params.childId);
        try {
            const updatedFolder = yield folderUsecase.addFolderToFolder(parentFolderId, childFolderId);
            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Subfolder added successfully', folder: updatedFolder });
        }
        catch (error) {
            console.error('Error adding subfolder to folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/folders/:id/remove-from-parent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        try {
            const folder = yield folderUsecase.removeFromParent(folderId);
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Folder removed from parent successfully', folder });
        }
        catch (error) {
            console.error('Error removing folder from parent:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
    app.post('/folders/:id/remove-from-folder', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const folderId = parseInt(req.params.id);
        try {
            const folder = yield folderUsecase.removeFromParent(folderId);
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            res.status(200).json({ message: 'Folder removed from parent successfully', folder });
        }
        catch (error) {
            console.error('Error removing folder from parent:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
};
exports.initFolderRoutes = initFolderRoutes;
