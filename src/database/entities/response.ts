import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Vote } from './vote';
import { User } from './user';

@Entity({ name: "reponse" })
export class Response {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @ManyToOne(() => Vote, vote => vote.responses)
    vote!: Vote;

    @ManyToOne(() => User, user => user.responses)
    user!: User;
}
