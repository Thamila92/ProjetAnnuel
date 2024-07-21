import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Projet } from "./projet";
import { Mission } from "./mission";

@Entity({ name: "step" })
export class Step {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    state: string;

    @Column()
    description: string;

    @Column({ type: "datetime" })
    starting: Date;

    @Column({ type: "datetime" })
    ending: Date;

    @ManyToOne(() => Projet, (projet) => projet.steps)
    projet: Projet;

    @ManyToOne(() => Mission, (mission) => mission.step)
    missions: Mission[];

    constructor(id: number, state: string, description: string, starting: Date, ending: Date, projet: Projet, missions: Mission[]) {
        this.id = id;
        this.state = state;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
        this.projet = projet;
        this.missions = missions;
    }
}