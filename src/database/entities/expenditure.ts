import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Donation } from "./donation";

@Entity()
export class Expenditures {
    @PrimaryGeneratedColumn()
    id!: number

    // @Column()
    // userId!: number

    // @Column()
    // donationId!: number

    @Column()
    amount!: number

    @Column()
    description!:string

    @ManyToOne(() => User, (user) => user.expenditures)
    user!: User

    @ManyToOne(() => Donation, (donation) => donation.expenditures)
    donation!: Donation
}