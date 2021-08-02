import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../entities/user.entity';
import { CreateUserPayload } from './user.payload';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	async getOne(id: string): Promise<User> {
		return this.userRepository.findOne(id);
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

		const user = this.userRepository.create({ ...payload });
		await this.userRepository.save(user);
		return { ...user, ...response };
	}

	async update(id: string, payload: CreateUserPayload): Promise<User> {
		return this.userRepository.findOne(id);
	}

	async remove(id: string): Promise<void> {
		await this.userRepository.delete(id);
	}
}
