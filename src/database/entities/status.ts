import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { User } from "./user";

export enum statustype {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  BENEFACTOR = "NORMAL",
  SALARIER = "SALARIER" 
}

@Entity()
export class Status {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: statustype })
    type!: statustype;

    @Column({ type: 'varchar', length: 255, nullable: true })  
    key!: string | null;

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;

    @OneToMany(() => User, user => user.status)
    users!: User[];
}
