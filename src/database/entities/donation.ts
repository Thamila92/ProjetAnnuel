import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Expenditures } from "./expenditure";

@Entity()
export class Donation {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    amount!:number

    @Column({ default: 0 })
    remaining!:number

    @Column()
    description!:string

    @Column({ default: false })
    isCanceled!: boolean;

    // @Column({ default: "FR7630006000011234567890189" })
    // destinationIBAN!:string
    
    @OneToMany(() => Expenditures, expenditures => expenditures.donation)
    expenditures!: Expenditures[];

    @ManyToOne(() => User, benefactor => benefactor.donations)
    benefactor!: User;

    @CreateDateColumn({type: "datetime"})
    createdAt!: Date

}
