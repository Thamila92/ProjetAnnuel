import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Resource } from "./ressource";

@Entity({ name: "resource_availability" })
export class ResourceAvailability {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "datetime" })
    start!: Date;

    @Column({ type: "datetime" })
    end!: Date;

    @ManyToOne(() => Resource, (resource) => resource.availabilities)
    resource!: Resource;
}
