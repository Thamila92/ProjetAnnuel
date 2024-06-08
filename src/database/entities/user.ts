import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinTable, ManyToMany } from "typeorm";
import { Status } from "./status";
import { Token } from "./token";
import { Expenditures } from "./expenditure";
import { Donation } from "./donation";
import { Review } from "./review";
import { Evenement } from "./evenement";
import { Mission } from "./mission";
import { Step } from "./step";
import { Projet } from "./projet";

@Entity()
export class User {
    compliances: any;

    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        unique: true
    })
    email!: string

    @Column()
    password!: string

    @Column()
    name!: string
    
    // @Column({ default: "FR7630006000011234567890189" })
    // iban?: string

    @CreateDateColumn({type: "datetime"})
    createdAt!: Date

    @ManyToOne(() => Status, status => status.users)
    status!:Status;

    @Column({ default: false })
    isDeleted!: boolean;

    @OneToMany(() => Token, token => token.user)
    tokens!: any[]

    @OneToMany(() => Evenement, ev => ev.user)
    evenements!: Evenement[]

    @OneToMany(() => Projet, projet => projet.user)
    projets!: []

    @OneToMany(() => Mission, mission=>mission.user)
    missions!:Mission[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[]

    @OneToMany(() => Donation, donation => donation.benefactor)
    donations!: Donation[]
    
    @OneToMany(() => Expenditures, expenditures => expenditures.user)
    expenditures!: Expenditures[];

}