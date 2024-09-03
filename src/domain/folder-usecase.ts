import { DataSource } from "typeorm";
import { Folder } from "../database/entities/folder";
import { Document } from "../database/entities/document";
import { User } from "../database/entities/user";
import { IsNull } from 'typeorm';

export interface CreateFolderParams {
    name: string;
    userId: number;
    parentId?: number; // optionnel, si le dossier a un parent
  }
export interface UpdateFolderParams {
    name?: string;
}

export class FolderUsecase {
    constructor(private readonly db: DataSource) {}

    // Créer un dossier
    async createFolder(params: CreateFolderParams): Promise<Folder> {
        const folderRepo = this.db.getRepository(Folder);
        const userRepo = this.db.getRepository(User);
    
        const user = await userRepo.findOne({ where: { id: params.userId } });
        if (!user) {
            throw new Error('User not found');
        }
    
        let parentFolder: Folder | null = null;  // Assigner null explicitement
        if (params.parentId) {
            parentFolder = await folderRepo.findOne({ where: { id: params.parentId } });
            if (!parentFolder) {
                throw new Error('Parent folder not found');
            }
        }
    
        const newFolder = folderRepo.create({ 
            name: params.name, 
            user, 
            parentFolder: parentFolder  // null si pas de parent
        });
    
        return await folderRepo.save(newFolder);
    }
    
    
    // Lister les dossiers et sous-dossiers d'un utilisateur
    async listFolders(userId: number): Promise<Folder[]> {
        const folderRepo = this.db.getRepository(Folder);
        return await folderRepo.find({ 
            where: { 
                user: { id: userId }, 
                parentFolder: IsNull()  // Utilisation de l'opérateur IsNull pour rechercher les dossiers racine
            }, 
            relations: ['documents', 'children'] // inclure les enfants dans la réponse
        });
    }

    // Mettre à jour un dossier
    async updateFolder(id: number, params: UpdateFolderParams): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
        let folder = await folderRepo.findOne({ where: { id } });

        if (!folder) return null;

        if (params.name) folder.name = params.name;

        return await folderRepo.save(folder);
    }

    // Supprimer un dossier et tous les documents associés
    async deleteFolder(id: number): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
        const documentRepo = this.db.getRepository(Document);

        const folder = await folderRepo.findOne({ where: { id }, relations: ['documents'] });

        if (!folder) return null;

        // Supprimer tous les documents associés
        await documentRepo.remove(folder.documents);

        // Supprimer le dossier
        await folderRepo.remove(folder);

        return folder;
    }

    // Récupérer un dossier par ID
    async getFolder(id: number): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
        return await folderRepo.findOne({ 
          where: { id }, 
          relations: ['documents', 'children'] // inclure les sous-dossiers
        });
      }


    async addFileToFolder(folderId: number, fileId: number): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
        const documentRepo = this.db.getRepository(Document);

        const folder = await folderRepo.findOne({ where: { id: folderId }, relations: ['documents'] });
        if (!folder) {
            throw new Error('Folder not found');
        }

        const document = await documentRepo.findOne({ where: { id: fileId } });
        if (!document) {
            throw new Error('Document not found');
        }

        // Ajouter le document au dossier
        folder.documents.push(document);

        // Sauvegarder le dossier avec les documents associés
        return await folderRepo.save(folder);
    }
    async addFolderToFolder(parentFolderId: number, childFolderId: number): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
    
        const parentFolder = await folderRepo.findOne({ where: { id: parentFolderId }, relations: ['children'] });
        if (!parentFolder) {
          throw new Error('Parent folder not found');
        }
    
        const childFolder = await folderRepo.findOne({ where: { id: childFolderId } });
        if (!childFolder) {
          throw new Error('Child folder not found');
        }
    
        // Ajouter le sous-dossier au dossier parent
        childFolder.parentFolder = parentFolder;
        return await folderRepo.save(childFolder);
      }

      async removeFromParent(folderId: number): Promise<Folder | null> {
        const folderRepo = this.db.getRepository(Folder);
        const folder = await folderRepo.findOne({ where: { id: folderId } });
    
        if (!folder) return null;
    
        folder.parentFolder = null; // Supprime la relation de parenté
        return await folderRepo.save(folder);
    }
    
}
