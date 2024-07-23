import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Evenement } from './evenement';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: "" })
    title!: string;

    @Column()
    message!: string;

    @Column({default:false})
    accepted!: boolean;

    @ManyToOne(() => User, user => user.notifications)
    user!: User;  // Correctly represents many-to-many relationship

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @ManyToOne(() => Evenement, event => event.notifications)
    event!: Evenement;
}
