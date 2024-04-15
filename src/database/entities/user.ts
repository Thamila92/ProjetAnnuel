import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Token } from "./token"
import "reflect-metadata"
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    email: string

    @Column()
    password: string

    @CreateDateColumn({type: "datetime"})
    createdAt: Date

    //@OneToMany(() => Token, token => token.user)
    //tokens: Token[];

    constructor(id: number, email: string, password: string, createdAt: Date, tokens: Token[]) {
        this.id = id;
        this.email = email; 
        this.password = password;
        this.createdAt = createdAt;
       // this.tokens = tokens;
    }
}