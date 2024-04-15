import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {Evenement}from "./evenement"



@Entity({ name: "evenement-category" })
export class EvenementCategory {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Evenement, (evenement) => evenement.category)
    evenement: Evenement[]

    constructor(id: number, name: string, products: Evenement[]) {
        this.id = id
        this.name = name
        this.evenement = products
    }
}