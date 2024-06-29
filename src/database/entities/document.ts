import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity()
export class UserDocument {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    type!: string;

    @Column()
    fileId!: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt!: Date;

    @ManyToOne(() => User, user => user.documents)
    user!: User;
}
