import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Subject } from './subject';
import { Response } from './response';

@Entity({ name: "vote" })
export class Vote {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    type!: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt!: Date;

    @ManyToOne(() => Subject, subject => subject.votes)
    subject!: Subject;

    @OneToMany(() => Response, response => response.vote)
    responses!: Response[];
}
