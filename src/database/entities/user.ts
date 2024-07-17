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
import { Document } from "./document";
import { Response } from "./response";
import { Note } from "./note";
import { Skill } from "./skill";
import { Notification } from './notification';




@Entity()
export class User {
    compliances: any;

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
    
    @ManyToMany(() => Skill, { eager: true })
    @JoinTable()
    skills!: Skill[];

    @OneToMany(() => Projet, projet => projet.user)
    projets!: []

    @ManyToMany(() => Mission, (mission) => mission.assignedUsers)
    missions!: Mission[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[]

    @OneToMany(() => Donation, donation => donation.benefactor)
    donations!: Donation[]
    
    @OneToMany(() => Expenditures, expenditures => expenditures.user)
    expenditures!: Expenditures[];
    @OneToMany(() => Response, response => response.user)
    responses!: Response[];

    @OneToMany(() => Document, document => document.user)
    documents!: Document[];
    @OneToMany(() => Note, note => note.user)  
    notes!: Note[];
    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];

}