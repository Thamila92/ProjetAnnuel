import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Mission } from "./mission";
import { User } from "./user";

enum eventtype {
    AG = "AG",
    suivi="SUIVI"
}

@Entity({ name: "evenement" })
export class Evenement {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: eventtype})
    type!: string;

    @Column()
    location!: string;

    @Column()
    description!: string;

    @Column({default:0})
    quorum!: number;

    @Column({ type: "datetime" })
    starting!: Date;

    @Column({ type: "datetime" })
    ending!: Date;

    @ManyToOne(() => User, (user) => user.evenements)
    user!: User;

    @OneToMany(() => Mission, (mission) => mission.evenement)
    mission!: Mission[];
}
