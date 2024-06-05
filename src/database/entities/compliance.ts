import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
//import { User } from "./user";
import { Mission } from "./mission";

@Entity({ name: "compliance" })
export class Compliance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column()
    status: string;

  //  @ManyToOne(() => User, (user) => user.compliances)
    //user: User;

    @ManyToOne(() => Mission, (mission) => mission.compliances)
    mission: Mission;

    //constructor(id: number, description: string, status: string, user: User, mission: Mission) {
    constructor(id: number, description: string, status: string, mission: Mission) {

        this.id = id;
        this.description = description;
        this.status = status;
       // this.user = user;
        this.mission = mission;
    }
}
