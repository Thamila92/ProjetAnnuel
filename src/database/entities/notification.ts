// <<<<<<< dev-brad-updt
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Notification {

// =======
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
// import { User } from './user';

// @Entity()
// export class Notification {
// >>>>>>> dev-brad
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
// <<<<<<< dev-brad-updt
    description!: string;

    @Column({default:false})
    lue!: boolean;

    @ManyToMany(() => User)
    @JoinTable()
    users!: User[];
    
}
// =======
//     title!: string;

//     @Column()
//     message!: string;

//     @ManyToOne(() => User, user => user.notifications)
//     user!: User;

//     @CreateDateColumn({type: "timestamp"})
//     createdAt!: Date;

//     @Column({ default: false })
//     read!: boolean;
// }
// >>>>>>> dev-brad
