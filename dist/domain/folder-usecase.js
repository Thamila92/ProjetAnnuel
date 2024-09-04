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
exports.FolderUsecase = void 0;
const folder_1 = require("../database/entities/folder");
const document_1 = require("../database/entities/document");
const user_1 = require("../database/entities/user");
const typeorm_1 = require("typeorm");
class FolderUsecase {
    constructor(db) {
        this.db = db;
    }
    // Créer un dossier
    createFolder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({ where: { id: params.userId } });
            if (!user) {
                throw new Error('User not found');
            }
            let parentFolder = null; // Assigner null explicitement
            if (params.parentId) {
                parentFolder = yield folderRepo.findOne({ where: { id: params.parentId } });
                if (!parentFolder) {
                    throw new Error('Parent folder not found');
                }
            }
            const newFolder = folderRepo.create({
                name: params.name,
                user,
                parentFolder: parentFolder // null si pas de parent
            });
            return yield folderRepo.save(newFolder);
        });
    }
    // Lister les dossiers et sous-dossiers d'un utilisateur
    listFolders(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            return yield folderRepo.find({
                where: {
                    user: { id: userId },
                    parentFolder: (0, typeorm_1.IsNull)() // Utilisation de l'opérateur IsNull pour rechercher les dossiers racine
                },
                relations: ['documents', 'children'] // Inclure les enfants et les documents
            });
        });
    }
    // Mettre à jour un dossier
    updateFolder(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            let folder = yield folderRepo.findOne({ where: { id } });
            if (!folder)
                return null;
            if (params.name)
                folder.name = params.name;
            return yield folderRepo.save(folder);
        });
    }
    moveToParent(folderId, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const folder = yield folderRepo.findOne({ where: { id: folderId }, relations: ['parentFolder'] });
            if (!folder) {
                return null;
            }
            const newParentFolder = yield folderRepo.findOne({ where: { id: parentId }, relations: ['children'] });
            if (!newParentFolder) {
                throw new Error('New parent folder not found');
            }
            folder.parentFolder = newParentFolder; // Définir le nouveau parent du dossier
            return yield folderRepo.save(folder); // Sauvegarder le dossier avec son nouveau parent
        });
    }
    // Supprimer un dossier et tous les documents associés
    deleteFolder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const documentRepo = this.db.getRepository(document_1.Document);
            // Trouver le dossier avec ses documents et sous-dossiers
            const folder = yield folderRepo.findOne({
                where: { id },
                relations: ['documents', 'children']
            });
            if (!folder)
                return null;
            // Supprimer tous les documents associés
            if (folder.documents && folder.documents.length > 0) {
                yield documentRepo.remove(folder.documents);
            }
            // Supprimer tous les sous-dossiers de manière récursive
            if (folder.children && folder.children.length > 0) {
                for (const childFolder of folder.children) {
                    yield this.deleteFolder(childFolder.id);
                }
            }
            // Supprimer le dossier lui-même
            yield folderRepo.remove(folder);
            return folder;
        });
    }
    // Récupérer un dossier par ID
    getFolder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            return yield folderRepo.findOne({
                where: { id },
                relations: ['documents', 'children', 'parentFolder'] // Inclure le parent dans les relations
            });
        });
    }
    removeFromParent(folderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const folder = yield folderRepo.findOne({ where: { id: folderId }, relations: ['parentFolder'] });
            if (!folder)
                return null;
            folder.parentFolder = null; // Supprime la relation de parenté
            return yield folderRepo.save(folder);
        });
    }
    addFileToFolder(folderId, fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const documentRepo = this.db.getRepository(document_1.Document);
            const folder = yield folderRepo.findOne({ where: { id: folderId }, relations: ['documents'] });
            if (!folder) {
                throw new Error('Folder not found');
            }
            const document = yield documentRepo.findOne({ where: { id: fileId } });
            if (!document) {
                throw new Error('Document not found');
            }
            // Ajouter le document au dossier
            folder.documents.push(document);
            // Sauvegarder le dossier avec les documents associés
            return yield folderRepo.save(folder);
        });
    }
    addFolderToFolder(parentFolderId, childFolderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderRepo = this.db.getRepository(folder_1.Folder);
            const parentFolder = yield folderRepo.findOne({ where: { id: parentFolderId }, relations: ['children'] });
            if (!parentFolder) {
                throw new Error('Parent folder not found');
            }
            const childFolder = yield folderRepo.findOne({ where: { id: childFolderId } });
            if (!childFolder) {
                throw new Error('Child folder not found');
            }
            // Ajouter le sous-dossier au dossier parent
            childFolder.parentFolder = parentFolder;
            return yield folderRepo.save(childFolder);
        });
    }
}
exports.FolderUsecase = FolderUsecase;
