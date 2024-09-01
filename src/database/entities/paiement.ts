// entities/paiement.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Donation } from "./donation";
import { Cotisation } from "./cotisation";

@Entity({ name: "paiements" })
export class Paiement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  stripePaymentId!: string; // ID Stripe

  @Column()
  amount!: number;

  @Column()
  currency!: string;

  @Column()
  status!: string;  

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @OneToOne(() => Donation, (donation) => donation.paiement, { nullable: true })
  donation!: Donation | null;

  @OneToOne(() => Cotisation, (cotisation) => cotisation.paiement, { nullable: true })
  cotisation!: Cotisation | null;
}
