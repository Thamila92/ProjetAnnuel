// entities/donation.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user";
import { Paiement } from "./paiement";

@Entity({ name: "donations" })
export class Donation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nom!: string;

  @Column()
  prenom!: string;

  @Column()
  email!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @ManyToOne(() => User, user => user.donations, { nullable: true })
  user!: User | null;  

  @OneToOne(() => Paiement)
  @JoinColumn() // Lie ce don à un paiement particulier
  paiement!: Paiement;
}
