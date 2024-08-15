import express, { Request, Response } from "express";
import { EvenementUsecase } from "../../domain/evenement-usecase";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { evenementValidation, evenementUpdateValidation, evenementIdValidation, listEvenementsValidation } from "../validators/evenement-validator";

export const initEvenementRoutes = (app: express.Express) => {
    const evenementUsecase = new EvenementUsecase(AppDataSource);

    // CREATE a new evenement
    app.post('/evenements', async (req: Request, res: Response) => {
        try {
            const validationResult = evenementValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await evenementUsecase.createEvenement(validationResult.value);

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

    // READ/List all evenements
    app.get('/evenements', async (req: Request, res: Response) => {
        try {
            const validationResult = listEvenementsValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await evenementUsecase.listEvenements(validationResult.value);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // READ/Find an evenement by ID
    app.get('/evenements/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = evenementIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await evenementUsecase.getEvenement(Number(req.params.id));
            if (!result) {
                res.status(404).json({ error: "Event not found" });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });

    // UPDATE an evenement
app.patch('/evenements/:id', async (req: Request, res: Response) => {
    try {
        const validationResult = evenementUpdateValidation.validate(req.body);
        if (validationResult.error) {
            res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
            return;
        }

        const result = await evenementUsecase.updateEvenement(Number(req.params.id), validationResult.value);

        if (typeof result === 'string') {
            res.status(400).json({ error: result });
        } else if (!result) {
            res.status(404).json({ error: "Event not found" });
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal error, please try again later" });
    }
});

    // DELETE an evenement
    app.delete('/evenements/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = evenementIdValidation.validate({ id: req.params.id });
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const result = await evenementUsecase.deleteEvenement(Number(req.params.id));

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json({ message: "Event deleted successfully", event: result });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal error, please try again later" });
        }
    });
};
