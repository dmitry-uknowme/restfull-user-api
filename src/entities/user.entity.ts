import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export default class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	login: string;

	@Column()
	password: string;

	// @ManyToMany((type) => Role, { cascade: true,eager:true })
	// @JoinTable()
	// roles: Role[];
	@ManyToMany((type) => Role, (role) => role.users)
	@JoinTable({
		name: 'user_role',
		joinColumns: [{ name: 'user_id' }],
		inverseJoinColumns: [{ name: 'role_id' }],
	})
	roles: Role[];
}
