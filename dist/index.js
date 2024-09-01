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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./database/database");
const swagger_1 = require("./swagger/swagger");
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const evenement_routes_1 = require("./handlers/routes/evenement_routes");
const mission_routes_1 = require("./handlers/routes/mission_routes");
const status_routes_1 = require("./handlers/routes/status_routes");
const users_routes_1 = require("./handlers/routes/users_routes");
const ressources_routes_1 = require("./handlers/routes/ressources_routes");
const skill_routes_1 = require("./handlers/routes/skill_routes");
const demande_routes_1 = require("./handlers/routes/demande_routes");
const donation_routes_1 = require("./handlers/routes/donation_routes");
const payement_routes_1 = require("./handlers/routes/payement_routes");
const cotisation_routes_1 = require("./handlers/routes/cotisation_routes");
const document_routes_1 = require("./handlers/routes/document_routes");
const folder_routes_1 = require("./handlers/routes/folder_routes");
const email_routes_1 = require("./handlers/routes/email-routes");
const _votesession_routes_1 = require("./handlers/routes/ votesession_routes");
const vote_routes_1 = require("./handlers/routes/vote_routes");
const admindashboard_routes_1 = require("./handlers/routes/admindashboard_routes");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const port = 3000;
    app.use((0, cors_1.default)());
    try {
        yield database_1.AppDataSource.initialize();
        console.log("well connected to database");
    }
    catch (error) {
        console.error("Cannot contact database:", error);
        process.exit(1);
    }
    app.use(express_1.default.json());
    // Initialiser les routes
    (0, evenement_routes_1.initEvenementRoutes)(app);
    (0, mission_routes_1.initMissionRoutes)(app);
    (0, status_routes_1.initStatusRoutes)(app);
    (0, users_routes_1.initUserRoutes)(app);
    (0, ressources_routes_1.initResourceRoutes)(app);
    (0, skill_routes_1.initSkillRoutes)(app);
    (0, demande_routes_1.initDemandeRoutes)(app);
    (0, donation_routes_1.initDonationRoutes)(app);
    (0, cotisation_routes_1.initCotisationRoutes)(app);
    (0, payement_routes_1.initPaymentRoutes)(app);
    (0, document_routes_1.initGoogleDriveRoutes)(app); // Initialiser les routes Supabase
    (0, folder_routes_1.initFolderRoutes)(app);
    (0, email_routes_1.initEmailRoutes)(app);
    (0, _votesession_routes_1.initVoteSessionRoutes)(app);
    (0, vote_routes_1.initVoteRoutes)(app);
    (0, admindashboard_routes_1.initAdminDashboardRoutes)(app);
    // Swagger documentation
    (0, swagger_1.swaggerDocs)(app, port);
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
main();
