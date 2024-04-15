import express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { EvenementCategory } from "../database/entities/evenement-category";
import { myNewValidation } from "./validators/category-validator"; // Mettez à jour l'importation ici
import { generateValidationErrorMessage } from "./validators/generate-validation-message.ts";

export const initRoutes = (app: express.Express) => {
         app.get("/health", (req: Request, res: Response) => {
            res.send({ "message": "hello world" })
        })
    // Routes for Evenement Categories
    app.post("/evenement-categories", async (req: Request, res: Response) => {
        const validation = myNewValidation.validate(req.body);

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const categoryRequest = validation.value;
        const categoryRepo = AppDataSource.getRepository(EvenementCategory);
        try {
            const categoryCreated = await categoryRepo.save(categoryRequest);
            res.status(201).send(categoryCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
}
