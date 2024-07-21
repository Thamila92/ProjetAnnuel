
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user';
import { Mission } from './mission';

@Entity()
export class Skill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;
    
    @ManyToMany(() => User, (user) => user.skills)
    users: User[] | undefined;
    
    @ManyToMany(() => Mission, (mission) => mission.requiredSkills)
    missions: Mission[] | undefined;
}