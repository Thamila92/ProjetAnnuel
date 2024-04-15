import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EvenementCategory } from "./evenement-category";

@Entity({ name: "evenement" })
export class Evenement {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

 

    @CreateDateColumn({type: "datetime"})
    createdAt: Date

    @ManyToOne(() => EvenementCategory, (evenementCategory) => evenementCategory.evenement)
    category: EvenementCategory;

    constructor(id: number, name: string, price: number, createdAt: Date, category: EvenementCategory) {
        this.id = id
        this.name = name
       
        this.createdAt = createdAt
        this.category = category
    }
}