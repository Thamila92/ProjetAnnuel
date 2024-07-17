import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from './vote';

@Entity({ name: "subject"})
export class Subject {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @OneToMany(() => Vote, vote => vote.subject)
    votes!: Vote[];
}
