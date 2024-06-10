import express from "express";
import { initRoutes } from "./handlers/routes";
import { AppDataSource } from "./database/database";
import { OAuth2Client } from 'google-auth-library';
import { DocumentUsecase } from './domain/document-usecase';
import 'dotenv/config';
import { swaggerDocs } from "./swagger/swagger";
import "reflect-metadata";
import { Document } from './database/entities/document';
import { User } from './database/entities/user';
const paypal = require("./handlers/paypal");

const main = async () => {
    const app = express();
    const port = 3000;

    try {
        await AppDataSource.initialize();
        console.log("well connected to database");
    } catch (error) {
        console.log(error);
        console.error("Cannot contact database");
        process.exit(1);
    }

    const CLIENT_ID = process.env.CLIENT_ID  ;
    const CLIENT_SECRET = process.env.CLIENT_SECRET  ;
    const REDIRECT_URI = process.env.REDIRECT_URI ;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN ;

    const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

     const documentUsecase = new DocumentUsecase(AppDataSource, oAuth2Client);
 
    app.use(express.json());

    
    initRoutes(app, documentUsecase);

    swaggerDocs(app, port);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

main();
