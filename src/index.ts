import express from "express";
import { AppDataSource } from "./database/database";
import { swaggerDocs } from "./swagger/swagger";
import "reflect-metadata";
import cors from 'cors';
import 'dotenv/config';

import { initEvenementRoutes } from "./handlers/routes/evenement_routes";
import { initMissionRoutes } from "./handlers/routes/mission_routes";
import { initStatusRoutes } from "./handlers/routes/status_routes";
import { initUserRoutes } from "./handlers/routes/users_routes";
import { initResourceRoutes } from "./handlers/routes/ressources_routes";
import { initSkillRoutes } from "./handlers/routes/skill_routes";
import { initDemandeRoutes } from "./handlers/routes/demande_routes";
import { initDonationRoutes } from "./handlers/routes/donation_routes";
import { initPaymentRoutes } from "./handlers/routes/payement_routes";
import { initCotisationRoutes } from "./handlers/routes/cotisation_routes";
import { initGoogleDriveRoutes } from "./handlers/routes/document_routes";
import { initFolderRoutes } from "./handlers/routes/folder_routes";
import { initEmailRoutes } from "./handlers/routes/email-routes";
import { initVoteSessionRoutes } from "./handlers/routes/ votesession_routes";
import { initVoteRoutes } from "./handlers/routes/vote_routes";
import { initAdminDashboardRoutes } from "./handlers/routes/admindashboard_routes";
  
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

    app.use(express.json());

    // Initialiser les routes
    initEvenementRoutes(app);
    initMissionRoutes(app);
    initStatusRoutes(app);
    initUserRoutes(app);
    initResourceRoutes(app);
    initSkillRoutes(app);
    initDemandeRoutes(app);
    initDonationRoutes(app);
    initCotisationRoutes(app);
    initPaymentRoutes(app);
    initGoogleDriveRoutes(app);  // Initialiser les routes Supabase
    initFolderRoutes(app);
    initEmailRoutes(app);
    initVoteSessionRoutes(app);
    initVoteRoutes(app);
    initAdminDashboardRoutes(app);
    // Swagger documentation
    swaggerDocs(app, port);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

main();
