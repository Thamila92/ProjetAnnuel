import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, AfterInsert, AfterRemove, BeforeInsert } from "typeorm";
import { Vote } from "./vote";
import { Proposition } from "./proposition";
import { AppDataSource } from "../database";

@Entity()
export class Round {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: false })
    isDeleted!: boolean;


    @Column()
    description!: string;

    @Column({default:5})
    npropositions!: number;

    @Column({ type: "datetime" })
    starting!: Date;

    @Column({ type: "datetime" })
    ending!: Date;

    @ManyToOne(() => Vote, (vote) => vote.rounds, { onDelete: 'CASCADE' })
    vote!: Vote;

    @OneToMany(() => Proposition, (proposition) => proposition.round)
    propositions!: Proposition[];

    @BeforeInsert()
    async checkAndDecrementNrounds() {
        if (this.vote && this.vote.nrounds > 0) {
            this.vote.nrounds--;
            await AppDataSource.getRepository(Vote).save(this.vote);
        } else {
            throw new Error("Cannot create round: no remaining rounds available.");
        }
    }

    @AfterRemove()
    async incrementNrounds() {
        if (this.vote) {
            this.vote.nrounds++;
            await AppDataSource.getRepository(Vote).save(this.vote);
        }
    }
}
