import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Mission } from "./mission";
import { User } from "./user";

@Entity({ name: "review" })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column({ type: "datetime" })
    createdAt: Date;

    @ManyToOne(() => Mission, (mission) => mission.reviews)
    mission: Mission;

    @ManyToOne(() => User, (user) => user.reviews)
    user: User;

    constructor(id: number, content: string, createdAt: Date, mission: Mission, user: User) {
    // constructor(id: number, content: string, createdAt: Date, mission: Mission) {

        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.mission = mission;
        this.user = user;
    }
}
