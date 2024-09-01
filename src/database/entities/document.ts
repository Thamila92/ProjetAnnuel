import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Folder } from './folder';

@Entity() 
export class Document {
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

  @ManyToOne(() => Folder, folder => folder.documents, { nullable: true })
  folder!: Folder; 
}
