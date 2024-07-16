import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Notification {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description!: string;

    @Column({default:false})
    lue!: boolean;

    @ManyToMany(() => User)
    @JoinTable()
    users!: User[];
    
}