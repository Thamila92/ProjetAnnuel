import express, { Request, Response } from "express";
 import { AppDataSource } from "../../database/database";
import { ResourceUsecase } from "../../domain/ressource-usecase";
import { resourceValidation } from "../validators/ressource-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
 
export const initResourceRoutes = (app: express.Express) => {
    const resourceUsecase = new ResourceUsecase(AppDataSource);

    // CREATE a new resource
    app.post('/resources', async (req: Request, res: Response) => {
        try {
            const validationResult = resourceValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const { name, type, isAvailable } = validationResult.value;
            const newResource = await resourceUsecase.createResource(name, type, isAvailable);
            res.status(201).json(newResource);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // UPDATE a resource
    // PATCH a resource
app.patch('/resources/:id', async (req: Request, res: Response) => {
    try {
        const validationResult = resourceValidation.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
            return;
        }

        const updatedResource = await resourceUsecase.updateResource(Number(req.params.id), validationResult.value);
        if (!updatedResource) {
            res.status(404).json({ error: "Resource not found" });
        } else {
            res.status(200).json(updatedResource);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal error, please try again later" });
    }
});
    // GET all available resources
    app.get('/resources/available', async (req: Request, res: Response) => {
        try {
            const availableResources = await resourceUsecase.getAvailableResources();
            res.status(200).json(availableResources);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // GET resources by mission ID
    app.get('/missions/:missionId/resources', async (req: Request, res: Response) => {
        try {
            const resources = await resourceUsecase.getResourcesByMission(Number(req.params.missionId));
            res.status(200).json(resources);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // ASSIGN resources to a mission
    app.post('/missions/:missionId/resources', async (req: Request, res: Response) => {
        try {
            const { resourceIds } = req.body;
            const result = await resourceUsecase.assignResourcesToMission(Number(req.params.missionId), resourceIds);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // RELEASE resources from a mission
    app.delete('/missions/:missionId/resources', async (req: Request, res: Response) => {
        try {
            const result = await resourceUsecase.releaseResourcesFromMission(Number(req.params.missionId));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // CLEAN UP expired availabilities
    app.post('/resources/cleanup', async (req: Request, res: Response) => {
        try {
            await resourceUsecase.cleanUpExpiredAvailabilities();
            res.status(200).json({ message: "Expired availabilities cleaned up" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // GET all resources
    app.get('/resources', async (req: Request, res: Response) => {
        try {
            const allResources = await resourceUsecase.getAllResources();
            res.status(200).json(allResources);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    app.delete('/resources/:id', async (req: Request, res: Response) => {
        try {
            const deleted = await resourceUsecase.deleteResource(Number(req.params.id));
            if (!deleted) {
                res.status(404).json({ error: "Resource not found" });
            } else {
                res.status(200).json({ message: "Resource deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
    
};
