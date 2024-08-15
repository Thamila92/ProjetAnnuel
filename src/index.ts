import express from "express";
import { AppDataSource } from "./database/database";
import { swaggerDocs } from "./swagger/swagger";
import "reflect-metadata";
import { DocumentUsecase } from './domain/document-usecase';
import { OAuth2Client } from 'google-auth-library';
import cors from 'cors';
import 'dotenv/config';

import { initEvenementRoutes } from "./handlers/routes/evenement_routes";
import { initMissionRoutes } from "./handlers/routes/mission_routes";
import { initStatusRoutes } from "./handlers/routes/status_routes";
import { initUserRoutes } from "./handlers/routes/users_routes";
import { initResourceRoutes } from "./handlers/routes/ressources_routes";
import { initSkillRoutes } from "./handlers/routes/skill_routes";

const main = async () => {
    const app = express();
    const port = 3000;
    app.use(cors());

    try {
        await AppDataSource.initialize();
        console.log("well connected to database");
    } catch (error) {
        console.error("Cannot contact database:", error);
        process.exit(1);
    }

    // Configurez votre client OAuth2 avec vos credentials Google
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

    const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const documentUsecase = new DocumentUsecase(AppDataSource, oAuth2Client);

    app.use(express.json());

    // Initialiser les routes
    initEvenementRoutes(app);
    initMissionRoutes(app);
    initStatusRoutes(app);
    initUserRoutes(app);
    initResourceRoutes(app);
    initSkillRoutes(app);
     swaggerDocs(app, port);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

main();
