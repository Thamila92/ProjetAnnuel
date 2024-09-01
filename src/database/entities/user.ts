import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, ManyToOne, JoinTable, CreateDateColumn } from "typeorm";
import { Skill } from "./skill";
import { Notification } from "./notification";
import { Status } from "./status";
import { Token } from "./token";
import { Evenement } from "./evenement";
 import { Mission } from "./mission";
import { Review } from "./review";
import { Donation } from "./donation";
import { Location } from "./location";
import { Document } from "./document";
import { Vote } from "./vote";
import { Demande } from "./demande";
import { Cotisation } from "./cotisation";
import { EvenementAttendee } from "./evenementAttendee";
import { Folder } from "./folder";

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

    @Column({ nullable: true }) // L'adresse est facultative
    adresse?: string;

    @Column({ type: 'date', nullable: true }) // La date de naissance est facultative
    dateDeNaissance?: Date;

    // Relations existantes...
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

    @Column({ default: true })
    isAvailable!: boolean;

    @OneToMany(() => Token, token => token.user)
    tokens!: Token[];

    @OneToMany(() => Evenement, ev => ev.user)
    evenements!: Evenement[];

 

    @ManyToMany(() => Mission, mission => mission.assignedUsers)
    missions!: Mission[];

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[];

    @OneToMany(() => Donation, (donation) => donation.user)
    donations!: Donation[];

    @OneToMany(() => Location, location => location.user)
    locations!: Location[];

    @OneToMany(() => Document, document => document.user)
    documents!: Document[];

    @OneToMany(() => Vote, vote => vote.user)
    votes!: Vote[];

    @OneToMany(() => Demande, demande => demande.user)
    demandes!: Demande[];

    @OneToMany(() => Cotisation, cotisation => cotisation.user)
    cotisations!: Cotisation[];

    @OneToMany(() => EvenementAttendee, (attendee) => attendee.user)
    evenementAttendees!: EvenementAttendee[];
    @Column({ default: false })  // Nouveau champ pour le bannissement
    isBanned!: boolean;


    @OneToMany(() => Folder, folder => folder.user)
    folders!: Folder[];
}
