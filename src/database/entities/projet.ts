import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Step } from "./step";
import { User } from "./user";

@Entity({ name: "projet" })
export class Projet {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ default: false })
    isDeleted!: boolean;
    
    @Column()
    description!: string;

    @Column({ type: "datetime" })
    starting!: Date;

    @Column({ type: "datetime" })
    ending!: Date;

    @Column()
    state!: string;

    @OneToMany(() => Step, (step) => step.projet)
    steps!: Step[];

    @ManyToOne(() => User, user => user.projets)
    user!: User;

    constructor() {
        this.state = 'UNSTARTED';
    }
}
