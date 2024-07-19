import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Round } from "./round";

@Entity()
export class Vote {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description!: string;

    @Column({ default: 3 })
    nrounds!: number;

    @Column({ type: "datetime" })
    starting!: Date;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ type: "datetime" })
    ending!: Date;

    @OneToMany(() => Round, (round) => round.vote, { cascade: true }) // Added cascade option
    rounds!: Round[];
    subject: any;
    responses: any;

    // @ManyToOne(() => User, user => user.votes)
    // user!: User;
}