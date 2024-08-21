import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./user";

@Entity({ name: "demandes" })
export class Demande {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    nom!: string;

    @Column()
    prenom!: string;

    @Column()
    age!: number;

    @Column()
    phone!: string;

    @Column()
    profession!: string;

    @Column()
    titre!: string;

    @Column({ type: "text" })
    description!: string;

    @Column()
    budget!: number;

    @Column({ type: "date" })
    deadline!: string;

    @ManyToOne(() => User, user => user.documents)
    user!: User;
    
    @Column({ default: "en_attente" })
    statut!: string;  // Peut être 'en_attente', 'approuvée', ou 'rejetée'
}
