import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Mission } from "./mission";

@Entity({ name: "resource" })
export class Resource {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column({ default: true })
    isAvailable!: boolean;

    @ManyToMany(() => Mission, (mission) => mission.resources)
    missions!: Mission[];
}
