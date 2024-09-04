import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user';
import { Document } from './document';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn()
  id!: number ;

  @Column()
  name!: string;

  @ManyToOne(() => User, user => user.folders)
  user!: User;

  @ManyToOne(() => Folder, folder => folder.children, { nullable: true })  // Autoriser les valeurs null
  parentFolder!: Folder | null;  // Autoriser les valeurs null
  
  @OneToMany(() => Folder, folder => folder.parentFolder)
  children!: Folder[];

  @OneToMany(() => Document, document => document.folder)
  documents!: Document[];
}
