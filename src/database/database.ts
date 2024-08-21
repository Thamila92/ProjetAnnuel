import { DataSource } from "typeorm";


export const AppDataSource = new DataSource({
    type: "mysql",
    host: 'mysql-db',
    port: 3306,
    username: 'ensemble_autrement',  
    password: 'root',             
    database: 'ensemble_autrement',
    logging: true,
    synchronize: true,
    entities: [
        "src/database/entities/*.ts"
    ],
    migrations: [
        "src/database/entities/*.ts"
    ]
})