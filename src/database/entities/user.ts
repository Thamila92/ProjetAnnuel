import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Status } from "./status";
import { Token } from "./token";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        unique: true
    })
    email!: string

    @Column()
    password!: string
    
    @Column({ default: "FR7630006000011234567890189" })
    iban?: string

    @CreateDateColumn({type: "datetime"})
    createdAt!: Date

    @ManyToOne(() => Status, status => status.users)
    status!:Status;

    @OneToMany(() => Token, token => token.user)
    tokens!: any[]
}