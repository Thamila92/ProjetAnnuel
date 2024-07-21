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
import { Vote } from "./vote";
import { Location } from "./location";
import { EvenementAttendee } from "./evenement-attendee";
import { Document } from "./document";
import { Response } from "./response";
import { Note } from "./note";
import { Skill } from "./skill";
import { Notification } from './notification';


// >>>>>>> dev-brad


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

    @Column()
    name!: string

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

    @OneToMany(() => Location, location => location.user)
    locations!: Donation[]
    
    @OneToMany(() => Expenditures, expenditures => expenditures.user)
    expenditures!: Expenditures[];
    
    @OneToMany(() => Response, response => response.user)
    responses!: Response[];

    @OneToMany(() => Document, document => document.user)
    documents!: Document[];

    @OneToMany(() => Note, note => note.user)  
    notes!: Note[];

    @OneToMany(() => Notification, notification => notification.users)
    notifications!: Notification[];

    @OneToMany(() => EvenementAttendee, (attendee) => attendee.user)
    evenementAttendees!: EvenementAttendee[];
}