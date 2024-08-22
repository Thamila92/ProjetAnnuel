import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: 'mysql-annuel-companion-e56d.l.aivencloud.com',
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
})
