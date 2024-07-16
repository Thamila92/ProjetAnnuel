import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { User } from "./user";
import { Evenement } from "./evenement";

export enum AttendeeRole {
    IMPORTANT = "IMPORTANT",
    NORMAL = "NORMAL",
}

@Entity({ name: "evenement_attendee" })
export class EvenementAttendee {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Evenement, (evenement) => evenement.attendees)
    evenement!: Evenement;

    @ManyToOne(() => User, (user) => user.evenementAttendees)
    user!: User;

    @Column({ type: "enum", enum: AttendeeRole, default: AttendeeRole.NORMAL })
    role!: AttendeeRole;
}
