import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: "" })
    title!: string;

    @Column()
    message!: string;

    @ManyToMany(() => User, user => user.notifications)
    @JoinTable()
    users!: User[];  // Correctly represents many-to-many relationship

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @Column({ default: false })
    read!: boolean;
}
