import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./user";
import { Vote } from "./vote";
import { OptionVote } from "./optionVote";
import { Evenement } from "./evenement";

@Entity({ name: "vote_sessions" })
export class VoteSession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    titre!: string;

    @Column({ type: "text" })
    description!: string;

    @Column()
    modalite!: string;

    @Column({ default: 1 })
    tourActuel!: number;

    @Column()
    type!: string;  // "classique" ou "sondage"

    @ManyToMany(() => User)
    @JoinTable()
    participants!: User[];

    @CreateDateColumn({ type: "datetime" })
    dateDebut!: Date;

    @CreateDateColumn({ type: "datetime" })
    dateFin!: Date;

    @OneToMany(() => Vote, vote => vote.session)
    votes!: Vote[];

    @OneToMany(() => OptionVote, option => option.session)
    options!: OptionVote[];

    @ManyToOne(() => Evenement, (evenement) => evenement.votes, { nullable: true })  // nullable pour permettre les votes sans événement
    evenement?: Evenement | undefined;  // Utilise `undefined` pour les cas sans événement
}
