import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserPayload, UpdateUserPayload } from './user.payload';
import { UserService } from './user.service';

@Controller('/api/users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get(':id')
	getOne(@Param('id') id: number) {
		return this.userService.getOne(id);
	}

	@Get()
	getAll() {
		return this.userService.getAll();
	}

	@Post()
	create(@Body() payload: CreateUserPayload) {
		return this.userService.create(payload);
	}

	@Put(':id')
	update(@Param('id') id: number, @Body() payload: UpdateUserPayload) {
		return this.userService.update(id, payload);
	}

	@Delete(':id')
	remove(@Param('id') id: number) {
		return this.userService.remove(id);
	}
}
