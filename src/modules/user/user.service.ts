import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserPayload, UpdateUserPayload } from './user.payload';
import User from '../../entities/user.entity';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Role)
		private roleRepository: Repository<Role> // private UserLogger: Logger = new Logger()
	) {}

	async getOne(id: string): Promise<User> {
		return this.userRepository.findOne(id, { relations: ['roles'] });
	}

	async getAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	async create(payload: CreateUserPayload): Promise<User> {
		const errors = [];
		let response: Object = { success: true };

		if (!payload.login || payload?.login?.trim() === '') {
			errors.push('login was not provided');
		}

		if (payload.password || payload?.password?.trim() !== '') {
			if (!payload.password.match(/\d+/g)) {
				errors.push('password must contains at least one numeric character');
			}
			if (!payload.password.match(/[A-Z]/g)) {
				errors.push('password must contains at least one capital letter');
			}
		} else {
			errors.push('password was not provided');
		}

		if (errors.length) {
			response = { ...response, success: false, status: HttpStatus.BAD_REQUEST, errors };
			throw new HttpException(response, HttpStatus.BAD_REQUEST);
		}

		const user = this.userRepository.create({ ...payload, roles: [] });
		await this.userRepository.save(user);
		return { ...user, ...response };
	}

	async update(id: string, payload: UpdateUserPayload): Promise<any> {
		const errors = [];
		let response: Object = { success: true };
		const user = await this.userRepository.findOne(id, { relations: ['roles'] });
		this.userRepository.update(id, { login: payload?.login, password: payload?.password });
		if (payload.password || payload?.password?.trim() !== '') {
			if (!payload.password.match(/\d+/g)) {
				errors.push('password must contains at least one numeric character');
			}
			if (!payload.password.match(/[A-Z]/g)) {
				errors.push('password must contains at least one capital letter');
			}
		}

		if (payload.roles.length) {
			user.roles = [];
			payload.roles.map(async (role) => {
				const foundRole = await this.roleRepository.findOne(role);
				if (foundRole) {
					user.roles.push(foundRole);
				} else {
					errors.push(`role with id ${role} has not found`);
				}
			});
		}

		if (errors.length) {
			response = { ...response, success: false, status: HttpStatus.BAD_REQUEST, errors };
			throw new HttpException(response, HttpStatus.BAD_REQUEST);
		}
		await this.userRepository.save(user);
		return { ...user, ...response };
	}

	async remove(id: string): Promise<void> {
		await this.userRepository.delete(id);
	}
}
