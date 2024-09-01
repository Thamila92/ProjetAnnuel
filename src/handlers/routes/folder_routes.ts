import express, { Request, Response, Express } from 'express';
import { AppDataSource } from '../../database/database';
import { FolderUsecase } from '../../domain/folder-usecase';

// Initialiser les routes pour les dossiers
export const initFolderRoutes = (app: Express) => {
    const folderUsecase = new FolderUsecase(AppDataSource);

    // Route pour créer un dossier
    app.post('/folder', async (req: Request, res: Response) => {
        const { name } = req.body;
        const userId = req.body.userId || undefined; // Remplacer par l'ID réel de l'utilisateur connecté

        try {
            const newFolder = await folderUsecase.createFolder({ name, userId });
            res.status(201).json(newFolder);
        } catch (error) {
            console.error('Error creating folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour lister tous les dossiers d'un utilisateur
    app.get('/folders', async (req: Request, res: Response) => {
        const userId = req.body.userId || undefined; // Remplacer par l'ID réel de l'utilisateur connecté

        try {
            const folders = await folderUsecase.listFolders(userId);
            res.status(200).json(folders);
        } catch (error) {
            console.error('Error listing folders:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour obtenir un dossier spécifique par ID
    app.get('/folder/:id', async (req: Request, res: Response) => {
        const folderId = parseInt(req.params.id);

        try {
            const folder = await folderUsecase.getFolder(folderId);

            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            res.status(200).json(folder);
        } catch (error) {
            console.error('Error fetching folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour mettre à jour un dossier
    app.patch('/folder/:id', async (req: Request, res: Response) => {
        const folderId = parseInt(req.params.id);
        const { name } = req.body;

        try {
            const updatedFolder = await folderUsecase.updateFolder(folderId, { name });

            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            res.status(200).json({ message: 'Folder updated successfully', folder: updatedFolder });
        } catch (error) {
            console.error('Error updating folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour supprimer un dossier et ses documents associés
    app.delete('/folder/:id', async (req: Request, res: Response) => {
        const folderId = parseInt(req.params.id);

        try {
            const deletedFolder = await folderUsecase.deleteFolder(folderId);

            if (!deletedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            res.status(200).json({ message: 'Folder and its documents deleted successfully', folder: deletedFolder });
        } catch (error) {
            console.error('Error deleting folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    app.post('/folders/:id/add-file', async (req: Request, res: Response) => {
        const folderId = parseInt(req.params.id);
        const { fileId } = req.body;

        try {
            const updatedFolder = await folderUsecase.addFileToFolder(folderId, fileId);

            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            res.status(200).json({ message: 'File added to folder successfully', folder: updatedFolder });
        } catch (error) {
            console.error('Error adding file to folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.post('/folders/:parentId/add-folder/:childId', async (req, res) => {
        const parentFolderId = parseInt(req.params.parentId);
        const childFolderId = parseInt(req.params.childId);
    
        try {
            const updatedFolder = await folderUsecase.addFolderToFolder(parentFolderId, childFolderId);
    
            if (!updatedFolder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
    
            res.status(200).json({ message: 'Subfolder added successfully', folder: updatedFolder });
        } catch (error) {
            console.error('Error adding subfolder to folder:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.post('/folders/:id/remove-from-folder', async (req, res) => {
        const folderId = parseInt(req.params.id);
    
        try {
            const folder = await folderUsecase.removeFromParent(folderId);
    
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
    
            res.status(200).json({ message: 'Folder removed from parent successfully', folder });
        } catch (error) {
            console.error('Error removing folder from parent:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    
      
};
