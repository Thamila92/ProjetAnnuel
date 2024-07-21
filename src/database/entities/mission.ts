import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { Evenement } from "./evenement";
import { User } from "./user";
import { Step } from "./step";
import { Review } from "./review";
import { Skill } from "./skill";
import { Resource } from "./ressource";

@Entity({ name: "mission" })
export class Mission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    starting: Date;

    @Column()
    ending: Date;

    @Column()
    description: string;

    @ManyToOne(() => Evenement, (evenement) => evenement.mission, { nullable: true })
    evenement?: Evenement;

    @ManyToOne(() => Step, (step) => step.missions, { nullable: true })
    step?: Step;

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
    
    constructor(starting: Date, ending: Date, description: string, evenement?: Evenement, step?: Step) {
        this.starting = starting;
        this.ending = ending;
        this.description = description;
        this.evenement = evenement;
        this.step = step;
    }
}
