import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { User } from "./user";

enum statustype{
    admin="ADMIN",
    other="NORMAL"
}

@Entity()
export class Status {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'enum', enum: statustype})
    description!: statustype;

    @Column({default:null})
    key!: string;

    @CreateDateColumn({type: "datetime"})
    createdAt!: Date

    @OneToMany(() => User, user => user.status)
    users!: User[];
}