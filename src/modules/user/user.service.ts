import { Injectable } from '@nestjs/common';
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
		return this.userRepository.create();
	}

	async update(id: string, payload: CreateUserPayload): Promise<User> {
		return this.userRepository.findOne(id);
	}

	async remove(id: string): Promise<void> {
		await this.userRepository.delete(id);
	}
}
