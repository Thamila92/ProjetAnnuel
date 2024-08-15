import {
    Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany
} from "typeorm";
import { User } from "./user";
import { Review } from "./review";
import { Skill } from "./skill";
import { Resource } from "./ressource";   

enum statustype {
    unstarted = "UNSTARTED",
    started = "STARTED",
    running = "RUNNING",
    ended = "ENDED"
}

@Entity({ name: "mission" })
export class Mission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    starting!: Date;

    @Column()
    ending!: Date;

    @Column()
    state!: string;

    @Column()
    description!: string;

    @ManyToMany(() => User, { eager: true })
    @JoinTable()
    assignedUsers!: User[];

    @ManyToMany(() => Skill, { eager: true })
    @JoinTable()
    requiredSkills!: Skill[];

    @OneToMany(() => Review, (review) => review.mission)
    reviews!: Review[];

    @ManyToMany(() => Resource, { eager: true })
    @JoinTable()
    resources!: Resource[];

    constructor(starting: Date, ending: Date, description: string, state: string = 'UNSTARTED') {
        this.starting = starting;
        this.ending = ending;
        this.description = description;
        this.state = state;
    }
}
