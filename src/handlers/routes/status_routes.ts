import express, { Request, Response } from "express";
import { StatusUsecase } from "../../domain/status-usecase";
import { AppDataSource } from "../../database/database";

import { createStatusValidation, updateStatusValidation, statusIdValidation } from "../validators/status-validator";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";

export const initStatusRoutes = (router: express.Router) => {
    const statusUsecase = new StatusUsecase(AppDataSource);

    // CREATE a new status
    router.post('/statuses', async (req: Request, res: Response) => {
        try {
            const validationResult = createStatusValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await statusUsecase.createStatus(validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(201).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // READ/List all statuses
    router.get('/statuses', async (req: Request, res: Response) => {
        try {
            const statuses = await statusUsecase.listStatuses();
            res.status(200).json(statuses);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // READ/Get one status by ID
    router.get('/statuses/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = statusIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const status = await statusUsecase.getStatusById(Number(req.params.id));
            if (!status) {
                res.status(404).json({ error: "Status not found" });
            } else {
                res.status(200).json(status);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // UPDATE a status
    router.patch('/statuses/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = updateStatusValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }
    
            const result = await statusUsecase.updateStatus(Number(req.params.id), validationResult.value);
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else if (!result) {
                res.status(404).json({ error: "Status not found" });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // DELETE a status
    router.delete('/statuses/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = statusIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await statusUsecase.deleteStatus(Number(req.params.id));
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json({ message: "Status deleted successfully", status: result });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
};
