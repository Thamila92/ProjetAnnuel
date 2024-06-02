import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Donation } from "./donation";

@Entity()
export class Expenditures {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;

    @Column()
    amount!: number;

    @Column()
    description!: string;

    @ManyToOne(() => User, (user) => user.expenditures)
    user!: User;

    @ManyToOne(() => Donation, (donation) => donation.expenditures)
    donation!: Donation;
}
