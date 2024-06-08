import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Evenement } from "./evenement";
import { Step } from "./step";
import { Review } from "./review";
import { Compliance } from "./compliance";
import { User } from "./user";

@Entity({ name: "mission" })
export class Mission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    starting: Date;

    @Column()
    ending: Date;

    @Column()
    description: string;

    @ManyToOne(() => Evenement, (evenement) => evenement.mission)
    evenement!: Evenement;

    @ManyToOne(() => User, (user) => user.missions)
    user!: User;

    @OneToMany(() => Step, (step) => step.mission)
    steps: Step[];

    @OneToMany(() => Review, (review) => review.mission)
    reviews: Review[];

    @OneToMany(() => Compliance, (compliance) => compliance.mission)
    compliances: Compliance[];

    constructor(id: number, starting: Date, ending: Date, description: string,steps:Step[], reviews:Review[], compliances:Compliance[]) {
        this.id = id;
        this.starting = starting;
        this.ending = ending;
        this.description = description;
        this.steps=steps;
        this.reviews = reviews;
        this.compliances=compliances;
    }
}
