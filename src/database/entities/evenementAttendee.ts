import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Evenement } from "./evenement";
import { User } from "./user";

@Entity({ name: "evenement_attendees" })
export class EvenementAttendee {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    email!: string;

    @Column()
    age!: number;

    @ManyToOne(() => User, user => user.documents)
    user!: User;
    
    @ManyToOne(() => Evenement, (evenement) => evenement.attendees)
    evenement!: Evenement;
}
