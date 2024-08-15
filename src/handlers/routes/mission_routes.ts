 
 import { adminMiddleware } from "../middleware/admin-middleware";


 import express, { Request, Response } from "express";
import { MissionUsecase } from "../../domain/mission-usecase";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import {  missionUpdateValidation, missionIdValidation, listMissionsValidation, missionCreateValidation } from "../validators/mission-validator";

export const initMissionRoutes = (app: express.Express) => {
    const missionUsecase = new MissionUsecase(AppDataSource);

    // CREATE a new mission
    app.post('/missions', async (req: Request, res: Response) => {
        try {
            const validationResult = missionCreateValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const { starting, ending, description, skills, userEmails, resources } = validationResult.value;
            const result = await missionUsecase.createMission(starting, ending, description, skills, userEmails, resources);

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

    // READ/List all missions
    app.get('/missions', async (req: Request, res: Response) => {
        try {
            const validationResult = listMissionsValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await missionUsecase.listMissions(validationResult.value);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // READ/Find a mission by ID
    app.get('/missions/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = missionIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await missionUsecase.getMission(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Mission not found" });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // UPDATE a mission
// PATCH a mission
app.patch('/missions/:id', async (req: Request, res: Response) => {
    try {
        const validationResult = missionUpdateValidation.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
            return;
        }

        const result = await missionUsecase.updateMission(Number(req.params.id), validationResult.value);

        if (typeof result === 'string') {
            res.status(400).json({ error: result });
        } else if (!result) {
            res.status(404).json({ error: "Mission not found" });
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal error, please try again later" });
    }
});


    // DELETE a mission
    app.delete('/missions/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = missionIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await missionUsecase.deleteMission(Number(req.params.id));

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else if (!result) {
                res.status(404).json({ error: "Mission not found" });
            } else {
                res.status(200).json({ message: "Mission deleted successfully", mission: result });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
};
