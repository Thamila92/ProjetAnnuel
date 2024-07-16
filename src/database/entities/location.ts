import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Location {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    position!: string;

    @ManyToOne(() => User, user => user.locations)
    user!: User;
}