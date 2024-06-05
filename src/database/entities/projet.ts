import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Step } from "./step";

@Entity({ name: "projet" })
export class Projet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column({ type: "datetime" })
    starting: Date;

    @Column({ type: "datetime" })
    ending: Date;

    @OneToMany(() => Step, (step) => step.projet)
    steps: Step[];

    constructor(id: number, description: string, starting: Date, ending: Date, steps:Step[]) {
        this.id = id;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
        this.steps=steps
    }
}
