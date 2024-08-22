import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";

@Entity({ name: "donations" })
export class Donation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    nom!: string;

    @Column()
    prenom!: string;

    @Column()
    montant!: number;

    @Column()
    date!: Date;

    @ManyToOne(() => User, (user) => user.donations, { nullable: true })
    user!: User;
    @Column()
    captureId!: string;  
}
