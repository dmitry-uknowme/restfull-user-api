import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import User from './user.entity';

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToMany((type) => User, (user) => user.roles, { cascade: true })
	users: User[];
}
