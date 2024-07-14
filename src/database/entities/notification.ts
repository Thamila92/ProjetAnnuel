import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    message!: string;

    @ManyToOne(() => User, user => user.notifications)
    user!: User;

    @CreateDateColumn({type: "timestamp"})
    createdAt!: Date;

    @Column({ default: false })
    read!: boolean;
}
