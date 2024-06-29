import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from "typeorm";
import { Round } from "./round";

@Entity()
export class Proposition {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: false })
    isDeleted!: boolean;
    
    @Column()
    description!: string;

    @Column({default:0})
    voices!:number;

    @ManyToOne(() => Round, round => round.propositions)
    round!:Round;
}