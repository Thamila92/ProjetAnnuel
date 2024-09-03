import {
    Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Program } from "./program";
import { Location } from "./location";
import { EvenementAttendee } from "./evenementAttendee";
import { eventtype, repetitivity } from "../../types/event-types";   
import { Notification } from "./notification";
import { VoteSession } from "./VoteSession";

@Entity({ name: "evenement" })
export class Evenement {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({
        type: "enum",
        enum: eventtype
    })
    type!: eventtype;  // Assurez-vous que ce champ est nommé `type`

    @Column()
    description!: string;

    @OneToMany(() => Program, (program) => program.evenement)
    program!: Program[];

    @Column({ default: 0 })
    quorum!: number;

    @Column({ type: "datetime" })
    starting!: Date;

    @Column({ type: "enum", enum: repetitivity })
    repetitivity!: repetitivity;

    @Column({ type: "datetime" })
    ending!: Date;

    @ManyToOne(() => User, (user) => user.evenements)
    user!: User;

    @OneToMany(() => EvenementAttendee, (attendee) => attendee.evenement)
    attendees!: EvenementAttendee[];

    @ManyToMany(() => Location)
    @JoinTable()
    location!: Location[];

    @Column({ default: false })
    isVirtual!: boolean;

    @Column({ nullable: true })
    virtualLink?: string;

    @Column()
    state: string = 'UNSTARTED';

    @OneToMany(() => Notification, (notification) => notification.event)
    notifications!: Notification[];

    @Column({ default: 100 })   
    maxParticipants!: number;

    @Column({ default: 0 })   
    currentParticipants!: number;

    @Column({ default: false })  
    membersOnly!: boolean;
    
    @OneToMany(() => VoteSession, (voteSession) => voteSession.evenement)
    votes!: VoteSession[]; 

    
}
