import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";
import { VoteSession } from "./VoteSession";
import { OptionVote } from "./optionVote";

@Entity({ name: "votes" })
export class Vote {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => VoteSession)
    session!: VoteSession;

    @ManyToOne(() => OptionVote, { nullable: true })
    option?: OptionVote | null;  // Option peut être null pour un vote classique

    @Column({ nullable: true })
    choix?: string;  // Choix sera défini uniquement pour un vote classique

    @Column()
    tour!: number;
}
