"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
require("dotenv/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: 'ensembleautrement-companion-e56d.g.aivencloud.com',
    port: 26768,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: 'ensemble_autrement',
    logging: true,
    synchronize: true,
    entities: [
        "dist/database/entities/*.js"
        // "src/database/entities/*.ts"
    ],
    migrations: [
        "dist/database/entities/*.js"
        // "src/database/entities/*.ts"
    ],
    ssl: {
        rejectUnauthorized: false
    },
    "driver": require('mysql2')
});
