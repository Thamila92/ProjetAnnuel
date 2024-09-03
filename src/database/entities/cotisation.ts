import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user";
import { Paiement } from "./paiement";

@Entity({ name: "cotisations" })
export class Cotisation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column()
  category!: string;  

  @Column()
  email!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 YEAR)',
  })
  expirationDate!: Date;
  

  @ManyToOne(() => User, user => user.cotisations, { nullable: true })
  user!: User | null;  

  @OneToOne(() => Paiement)
  @JoinColumn()
  paiement!: Paiement;
}
