import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Evenement } from "./evenement";

@Entity()
export class Program {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    description!: string;

    @OneToMany(() => Program, (program) => program.children)
    children!: Program[];

    @ManyToOne(() => Evenement, { nullable: true })
    evenement!: Evenement | null;
    
}