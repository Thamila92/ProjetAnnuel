import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VoteSession } from "./VoteSession";
import { Vote } from "./vote";

@Entity({ name: "vote_options" })
export class OptionVote {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    titre!: string;  

    @ManyToOne(() => VoteSession, session => session.options)
    session!: VoteSession;

    @OneToMany(() => Vote, vote => vote.option)
    votes!: Vote[];
}

