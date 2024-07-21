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
import { UserDocument } from "./document";
import { Vote } from "./vote";
import { Location } from "./location";
import { EvenementAttendee } from "./evenement-attendee";
import { Notification } from "./notification";
import { Note } from "./note";
import { Skill } from "./skill";


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

    @ManyToMany(() => Skill, skill => skill.users, { cascade: true })
    @JoinTable()
    skills!: Skill[];

    @ManyToMany(() => Notification, notification => notification.users)
    @JoinTable()
    notifications!: Notification[];

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

    @OneToMany(() => Mission, mission=>mission.assignedUsers)
    missions!:Mission[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[]

    @OneToMany(() => Donation, donation => donation.benefactor)
    donations!: Donation[]

    @OneToMany(() => Location, location => location.user)
    locations!: Location[]
    
    @OneToMany(() => Expenditures, expenditures => expenditures.user)
    expenditures!: Expenditures[];

    @OneToMany(() => UserDocument, document => document.user)
    documents!: UserDocument[];

    @OneToMany(() =>Vote, vote => vote.user)
    votes!: Vote[];

    @OneToMany(() =>Vote, note => note.user)
    notes!: Vote[];

    @OneToMany(() => EvenementAttendee, (attendee) => attendee.user)
    evenementAttendees!: EvenementAttendee[];

    // @ManyToOne(() => Notification, notification => notification.users)
    // notifications!: User;
}