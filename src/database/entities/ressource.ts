import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ResourceAvailability } from "./resourceAvailability";

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

    @OneToMany(() => ResourceAvailability, (availability) => availability.resource)
    availabilities!: ResourceAvailability[];
}
