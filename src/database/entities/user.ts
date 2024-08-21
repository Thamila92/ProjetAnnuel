import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
    ManyToOne, JoinTable, ManyToMany
} from "typeorm";
import { Status } from "./status";
import { Token } from "./token";
import { Expenditures } from "./expenditure";
import { Donation } from "./donation";
import { Review } from "./review";
import { Evenement } from "./evenement";
import { Mission } from "./mission";
 
import { Projet } from "./projet";
import { Document } from "./document";
import { Vote } from "./vote";
import { Location } from "./location";
import { EvenementAttendee } from "./evenementAttendee";
import { Notification } from "./notification";
 
import { Skill } from "./skill";
import { Demande } from "./demande";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    name!: string;

    @ManyToMany(() => Skill, skill => skill.users, { cascade: true })
    @JoinTable()
    skills!: Skill[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications!: Notification[];

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;

    @ManyToOne(() => Status, status => status.users)
    status!: Status;

    @Column({ default: false })
    isDeleted!: boolean;

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];

    @OneToMany(() => Evenement, ev => ev.user)
    evenements!: Evenement[];

    @OneToMany(() => Projet, projet => projet.user)
    projets!: Projet[];

    @ManyToMany(() => Mission, mission => mission.assignedUsers)
    missions!: Mission[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[];

    @OneToMany(() => Donation, donation => donation.benefactor)
    donations!: Donation[];

    @OneToMany(() => Location, location => location.user)
    locations!: Location[];

    @OneToMany(() => Expenditures, expenditures => expenditures.user)
    expenditures!: Expenditures[];

    @OneToMany(() => Document, document => document.user)
    documents!: Document[];

    @OneToMany(() => Vote, vote => vote.user)
    votes!: Vote[];
 

    @Column({ default: true })
    isAvailable!: boolean;

    @OneToMany(() => Demande, demande => demande.user)
    demandes!: Demande[]; // Relation avec les demandes

    @OneToMany(() => EvenementAttendee, (attendee) => attendee.user)
    evenementAttendees!: EvenementAttendee[]; 
}
