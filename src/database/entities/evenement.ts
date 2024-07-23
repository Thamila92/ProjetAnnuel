import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

import { Mission } from "./mission";
import { User } from "./user";
import { Program } from "./program";
import { Location } from "./location";
import { EvenementAttendee } from "./evenement-attendee";
import { eventtype } from "../../types/event-types";
import { Notification } from "./notification";

export enum repetitivity {
    NONE = "NONE",
    MONTHLY = "MONTHLY",
    ANNUAL = "ANNUAL",
}

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
    typee!: eventtype;

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

    @OneToMany(() => Mission, (mission) => mission.evenement)
    mission!: Mission[];

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
    state: string;

    constructor() {
        this.state = 'UNSTARTED';
    }
 
    @OneToMany(() =>Notification, vote => vote.event)
    notifications!: Notification[];
 }
