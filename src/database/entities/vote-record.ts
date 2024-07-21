import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Round } from "./round";
import { User } from "./user"; 

@Entity()
export class VoteRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Round)
    round!: Round;

    @Column()
    choice!: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
